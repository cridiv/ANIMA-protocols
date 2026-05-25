import { suiClient, getObjectFields } from './src/lib/sui';

async function main() {
  const packageId = '0xaf79d9aaf7fd188a4f7163003792c521f8d6a41a60ea7a1f360aebcec7006bdb';
  
  console.log("1. Finding a recently minted ANIMA object via events...");
  const events = await suiClient.queryEvents({
    query: { MoveEventType: `${packageId}::events::AnimaMinted` },
    limit: 1,
    order: 'descending'
  });
  
  if (events.data.length === 0) {
    console.log("No ANIMA objects have been minted yet for this package!");
    return;
  }
  
  const animaId = (events.data[0].parsedJson as any).anima_id;
  console.log(`Found ANIMA Object ID: ${animaId}\n`);
  
  console.log("2. Fetching core fields...");
  const fields = await getObjectFields(animaId);
  const parsedFields = fields as any;
  console.log(`Name:`, parsedFields?.name);
  console.log(`Reputation Score:`, parsedFields?.reputation_score);
  console.log(`Is Paused:`, parsedFields?.is_paused);
  console.log(`Wallet Balance:`, parsedFields?.wallet_balance);
  
  console.log("\n3. Fetching Dynamic Fields (Skill Registry)...");
  const dynamicFields = await suiClient.getDynamicFields({
    parentId: animaId
  });
  
  if (dynamicFields.data.length === 0) {
    console.log("No dynamic fields (skills) found on this agent yet.");
  } else {
    console.log(JSON.stringify(dynamicFields.data, null, 2));
  }
}

main().catch(console.error);
