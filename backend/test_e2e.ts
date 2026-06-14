import { Transaction } from '@mysten/sui/transactions';
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import * as dotenv from 'dotenv';
dotenv.config();

const SUI_RPC = getJsonRpcFullnodeUrl('testnet');
const client = new SuiJsonRpcClient({ url: SUI_RPC });

const privateKey = process.env.AGENT_PRIVATE_KEY!;
let secretKey;
if (privateKey.startsWith('suiprivkey')) {
  secretKey = decodeSuiPrivateKey(privateKey).secretKey;
} else {
  const buffer = Buffer.from(privateKey, 'base64');
  secretKey = buffer.length === 33 ? buffer.slice(1) : buffer;
}
const signer = Ed25519Keypair.fromSecretKey(secretKey);
const packageId = process.env.ANIMA_PACKAGE_ID!;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Using Operator/Guardian Wallet:', signer.toSuiAddress());

  // 1. Setup Phase: Mint an ANIMA agent
  console.log('\n[1] Minting a new ANIMA Agent...');
  let tx = new Transaction();
  const [agent, ownerCap, backendCap] = tx.moveCall({
    target: `${packageId}::protocol::mint_agent`,
    arguments: [
      tx.pure.string('E2E Test Agent'),
      tx.pure.address(signer.toSuiAddress()),
    ],
  });

  // Transfer capabilities to the caller
  tx.transferObjects([ownerCap, backendCap], tx.pure.address(signer.toSuiAddress()));
  
  // Make the agent a shared object
  tx.moveCall({
    target: `0x2::transfer::public_share_object`,
    typeArguments: [`${packageId}::protocol::ANIMA`],
    arguments: [agent],
  });

  let res = await client.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: { showEffects: true, showObjectChanges: true },
  });

  if (res.effects?.status.status !== 'success') {
    console.error('Failed to mint:', res.effects?.status.error);
    return;
  }

  // Find the agent ID and OwnerCap ID from the object changes
  const agentCreated = res.objectChanges?.find(c => c.type === 'created' && c.objectType.includes('::protocol::ANIMA')) as any;
  const capCreated = res.objectChanges?.find(c => c.type === 'created' && c.objectType.includes('::protocol::OwnerCap')) as any;
  
  const agentId = agentCreated.objectId;
  const ownerCapId = capCreated.objectId;
  console.log('✅ Agent Minted! ID:', agentId);
  console.log('✅ OwnerCap ID:', ownerCapId);

  // 2. Authorize the `transfer_funds` skill
  console.log('\n[2] Authorizing `transfer_funds` skill...');
  tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::skill_registry::authorize_skill`,
    arguments: [
      tx.object(agentId),
      tx.object(ownerCapId),
      tx.pure.string('transfer_funds'),
      tx.pure.string('walrus_blob_e2e_test_123'),
    ],
  });

  res = await client.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: { showEffects: true },
  });

  if (res.effects?.status.status !== 'success') {
    console.error('Failed to authorize skill:', res.effects?.status.error);
    return;
  }
  console.log('✅ Skill authorized!');

  // 3. Deposit some SUI into the Agent's wallet (so it can transfer)
  console.log('\n[3] Depositing 0.1 SUI into Agent Wallet...');
  tx = new Transaction();
  const [depositCoin] = tx.splitCoins(tx.gas, [100000000]); // 0.1 SUI
  tx.moveCall({
    target: `${packageId}::wallet::deposit_funds`,
    arguments: [
      tx.object(agentId),
      depositCoin,
    ],
  });

  res = await client.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: { showEffects: true },
  });

  if (res.effects?.status.status !== 'success') {
    console.error('Failed to deposit funds:', res.effects?.status.error);
    return;
  }
  console.log('✅ Funds deposited!');

  // Wait a moment for blockchain indexing
  console.log('\nWaiting 5 seconds before triggering backend API...');
  await sleep(5000);

  // 4. Trigger the Backend REST API (PTB Execution)
  console.log('\n[4] Triggering POST /agent/execute (Transfer Action)...');
  const executePayload = {
    animaObjectId: agentId,
    skillName: 'transfer_funds',
    actionType: 'transfer',
    transferParams: {
      recipient: signer.toSuiAddress(), // Send it back to the operator
      amount: 50000000, // Transfer 0.05 SUI out of the 0.1 SUI
      coinType: '0x2::sui::SUI'
    }
  };

  const response = await fetch('http://localhost:5000/agent/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(executePayload)
  });

  const responseData = await response.json();
  console.log('API Response:', responseData);

  if (responseData.status === 'success') {
    console.log('\n🎉 E2E TEST PASSED! The PTB was successfully executed by the backend.');
    console.log(`Transaction Digest: ${responseData.txDigest}`);
    
    // Wait for the indexer to catch the event
    console.log('\nWaiting 5 seconds for the indexer to pick up the event...');
    await sleep(5000);

    console.log('\n[5] Fetching events from GET /agent/:id/events...');
    const eventResponse = await fetch(`http://localhost:5000/agent/${agentId}/events`);
    const eventData = await eventResponse.json();
    console.log('Event Feed:', JSON.stringify(eventData, null, 2));
  } else {
    console.error('\n❌ API Execution Failed!');
  }
}

run().catch(console.error);
