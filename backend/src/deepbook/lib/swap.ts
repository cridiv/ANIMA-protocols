import { Transaction } from '@mysten/sui/transactions';

export interface SwapParams {
  poolId: string;
  fromToken: 'SUI' | 'USDC' | 'DBUSDC';
  toToken: 'SUI' | 'USDC' | 'DBUSDC';
  amountIn: bigint;
  minAmountOut: bigint;
  deepAmountIn?: bigint; // optional amount of DEEP to pay as fees
}

/**
 * Builds a DeepBook V3 swap transaction logic and appends it to the provided PTB.
 * 
 * Note: The DeepBookClient automatically adds the pool and clock objects internally
 * when using its SDK methods, so we don't need to manually call tx.object(params.poolId)
 * or tx.object('0x6').
 * 
 * @returns The TransactionResult array [baseOut, quoteOut, deepOut] to be chained.
 */
export function buildDeepBookSwap(
  tx: Transaction,
  deepBookTransactor: any,
  params: SwapParams
): any {
  const isBaseToQuote = params.fromToken === 'SUI';
  const deepAmount = params.deepAmountIn ?? 0n; // Default to 0 DEEP for fees if not provided

  if (isBaseToQuote) {
    return deepBookTransactor.swapExactBaseForQuote({
      poolKey: params.poolId, // Expected to be the pool key (e.g. 'SUI_DBUSDC')
      amount: params.amountIn,
      deepAmount: deepAmount,
      minOut: params.minAmountOut,
    })(tx);
  } else {
    return deepBookTransactor.swapExactQuoteForBase({
      poolKey: params.poolId,
      amount: params.amountIn,
      deepAmount: deepAmount,
      minOut: params.minAmountOut,
    })(tx);
  }
}

export interface TransferParams {
  amount: bigint;
}

/**
 * Fallback transfer function if DeepBook pools are unavailable.
 * Performs a simple SUI transfer from the agent wallet to a test address.
 * 
 * @returns The TransactionResult array [coin] to be chained for transfer.
 */
export function buildFallbackTransfer(
  tx: Transaction,
  params: TransferParams
): any {
  console.log('[PTB] Using fallback transfer — DeepBook unavailable');
  
  // Split the exact amount of SUI from gas
  const [coin] = tx.splitCoins(tx.gas, [params.amount]);
  
  // The PTB executor can take this returned array and call tx.transferObjects
  return [coin];
}
