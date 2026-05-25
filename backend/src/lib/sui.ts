import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

// 1. Instantiate SuiClient pointed at testnet RPC
// We export this singleton instance so it can be reused across all modules
export const suiClient = new SuiJsonRpcClient({ 
  url: getJsonRpcFullnodeUrl('testnet'),
  network: 'testnet' 
});
/**
 * 2. Helper function to fetch an object from the Sui network
 * We request showContent: true so that we can read the object's data
 */
export async function getObject(objectId: string) {
  return suiClient.getObject({
    id: objectId,
    options: {
      showContent: true,
    },
  });
}

/**
 * 3. Helper function to fetch an object and immediately parse its fields
 * Returns the parsed fields if it's a Move object, otherwise returns null.
 */
export async function getObjectFields(objectId: string) {
  const obj = await getObject(objectId);
  
  // Verify that the object exists and is a Move object with fields
  if (obj.data?.content?.dataType === 'moveObject') {
    return obj.data.content.fields;
  }
  
  return null;
}
