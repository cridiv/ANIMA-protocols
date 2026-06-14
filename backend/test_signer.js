import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import * as dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.AGENT_PRIVATE_KEY;
let secretKey;
if (privateKey.startsWith('suiprivkey')) {
  secretKey = decodeSuiPrivateKey(privateKey).secretKey;
} else {
  const buffer = Buffer.from(privateKey, 'base64');
  secretKey = buffer.length === 33 ? buffer.slice(1) : buffer;
}
const signer = Ed25519Keypair.fromSecretKey(secretKey);
console.log('Agent Address:', signer.toSuiAddress());
