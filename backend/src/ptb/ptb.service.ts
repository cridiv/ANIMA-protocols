import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { SuiService } from '../sui/sui.service.js';
import { DeepbookService } from '../deepbook/deepbook.service.js';
import { SwapParams as DeepbookSwapParams } from '../deepbook/lib/swap.js';

export interface SwapParams {
  poolId: string;
  amountIn: number;
  minAmountOut: number;
  coinTypeIn: string;
  coinTypeOut: string;
}

export interface TransferParams {
  recipient: string;
  amount: number;
  coinType: string;
}

export interface ExecuteParams {
  animaObjectId: string;
  skillName: string;
  actionType: 'swap' | 'transfer';
  swapParams?: SwapParams;
  transferParams?: TransferParams;
}

@Injectable()
export class PtbService {
  public readonly signer: Ed25519Keypair;
  private readonly logger = new Logger(PtbService.name);

  constructor(
    private readonly suiService: SuiService,
    private readonly deepbookService: DeepbookService,
  ) {
    // Load the agent's private key from the environment securely
    const privateKey = process.env.AGENT_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error('AGENT_PRIVATE_KEY is missing in the environment variables');
    }

    // Decode the private key. Support both the standard 'suiprivkey...' format and legacy base64
    let secretKey: Uint8Array;
    if (privateKey.startsWith('suiprivkey')) {
      secretKey = decodeSuiPrivateKey(privateKey).secretKey;
    } else {
      const buffer = Buffer.from(privateKey, 'base64');
      // Legacy base64 keys often have a 1-byte signature scheme flag prepended (0x00 for Ed25519)
      secretKey = buffer.length === 33 ? buffer.slice(1) : buffer;
    }

    // Instantiate the signer keypair using the extracted secret key
    this.signer = Ed25519Keypair.fromSecretKey(secretKey);
  }

  /**
   * Builds and executes an atomic PTB (Programmable Transaction Block) on behalf of the agent.
   */
  async buildAndExecutePTB(params: ExecuteParams) {
    // 0. Pre-flight check: Ensure agent is not paused
    const fields = await this.suiService.getObjectFields(params.animaObjectId) as any;
    if (!fields) {
      throw new Error(`[PTB] Could not fetch ANIMA object ${params.animaObjectId}`);
    }
    if (fields.is_paused) {
      this.logger.error(`[PTB] Agent ${params.animaObjectId} is paused. Aborting execution.`);
      throw new Error(`Agent ${params.animaObjectId} is paused.`);
    }

    const tx = new Transaction();
    tx.setGasBudget(10_000_000); // Prevent runaway gas costs during testing

    const packageId = process.env.ANIMA_PACKAGE_ID;
    if (!packageId) throw new Error('ANIMA_PACKAGE_ID is missing');

    // 1. Verify skill authorization
    const [skillAuth] = tx.moveCall({
      target: `${packageId}::anima::verify_skill_auth`,
      arguments: [
        tx.object(params.animaObjectId),
        tx.pure.string(params.skillName),
      ],
    });

    // 2. Execute the action
    let actionResult;

    if (params.actionType === 'swap') {
      if (!params.swapParams) throw new Error('swapParams required for swap action');

      // Call the DeepBook service instead of hardcoding the move call
      // Map PTB SwapParams to DeepbookSwapParams
      const deepbookParams: DeepbookSwapParams = {
        poolId: params.swapParams.poolId,
        fromToken: params.swapParams.coinTypeIn.includes('sui') ? 'SUI' : 'DBUSDC',
        toToken: params.swapParams.coinTypeOut.includes('sui') ? 'SUI' : 'DBUSDC',
        amountIn: BigInt(params.swapParams.amountIn),
        minAmountOut: BigInt(params.swapParams.minAmountOut),
      };

      const swapResult = this.deepbookService.executeSwap(tx, deepbookParams);

      // Extract the primary coin from the result array (which could be baseOut or quoteOut depending on direction)
      // The deepbook service returns [baseOut, quoteOut, deepOut]. We typically care about the received token.
      // If we swap Base to Quote, we receive quoteOut.
      const isBaseToQuote = deepbookParams.fromToken === 'SUI';
      const receivedCoin = isBaseToQuote ? swapResult[1] : swapResult[0];

      // Note: we can only emit an event on a single object. If using fallback, it returns [coin], so index 0.
      const coinToEmit = process.env.USE_DEEPBOOK_FALLBACK === 'true' ? swapResult[0] : receivedCoin;

      tx.moveCall({
        target: `${packageId}::events::emit_action`,
        arguments: [
          tx.object(params.animaObjectId),
          coinToEmit,
        ],
      });

      // Transfer received coins to the agent's owner
      tx.transferObjects(swapResult, tx.pure.address(this.signer.toSuiAddress()));

    } else if (params.actionType === 'transfer') {
      if (!params.transferParams) throw new Error('transferParams required for transfer action');

      // Call wallet::extract_funds_for_action
      const [extractedCoin] = tx.moveCall({
        target: `${packageId}::wallet::extract_funds_for_action`,
        arguments: [
          tx.object(params.animaObjectId),
          tx.pure.u64(params.transferParams.amount),
        ],
      });

      tx.moveCall({
        target: `${packageId}::events::emit_action`,
        arguments: [
          tx.object(params.animaObjectId),
          extractedCoin,
        ],
      });

      tx.transferObjects([extractedCoin], tx.pure.address(params.transferParams.recipient));

    } else {
      throw new Error(`Unsupported actionType: ${params.actionType}`);
    }

    // Sign and execute the transaction
    const response = await this.suiService.suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: this.signer,
      options: {
        showEffects: true,
        showEvents: true,
      }
    });

    if (response.effects?.status.status === 'success') {
      this.logger.log(`[PTB] Success! Transaction Digest: ${response.digest}`);
    } else {
      this.logger.error(`[PTB] Failed execution! Error: ${response.effects?.status.error}`);
    }

    return response;
  }
}
