-- 1. Remove the unique constraint on tx_digest in the agent_actions table.
-- This allows multiple logs/actions (e.g., SWAP, COMPUTE, TRANSFER, etc.) to share the same transaction digest
-- if they occur within the same Programmable Transaction Block (PTB).
ALTER TABLE agent_actions DROP CONSTRAINT IF EXISTS agent_actions_tx_digest_key;

-- 2. Drop any matching unique index if it was created as an index rather than a constraint.
DROP INDEX IF EXISTS agent_actions_tx_digest_idx;

-- 3. Create a policy to allow public inserts on the agent_actions table.
-- This enables the frontend dApp to write deposit/transfer events directly to the database.
CREATE POLICY "Allow public insert on agent_actions" 
  ON agent_actions FOR INSERT 
  WITH CHECK (true);

-- 4. Create a policy to allow public update on the agents table.
-- This allows the frontend to update details like the cached wallet balance immediately after a transaction.
CREATE POLICY "Allow public update on agents" 
  ON agents FOR UPDATE 
  USING (true) 
  WITH CHECK (true);
