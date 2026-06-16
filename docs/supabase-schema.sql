-- 1. All minted ANIMA agents identity container registry
create table if not exists agents (
  id uuid default gen_random_uuid() primary key,
  object_id text unique not null,       -- ANIMA object ID on Sui
  name text not null,                   -- Agent name
  owner_address text not null,          -- Address holding the OwnerCap
  owner_cap_id text not null,           -- OwnerCap object ID
  is_paused boolean default false,      -- Operational mode status
  reputation_score bigint default 100,  -- On-chain reputation
  wallet_balance bigint default 0,      -- In MIST (1 SUI = 1,000,000,000 MIST)
  created_at timestamptz default now(),
  minted_at_checkpoint bigint           -- Sui checkpoint at mint
);

-- 2. Every on-chain autonomous trade, action, or settlement logs
create table if not exists agent_actions (
  id uuid default gen_random_uuid() primary key,
  agent_object_id text not null references agents(object_id) on delete cascade,
  tx_digest text unique not null,       -- Sui transaction hash
  action_type text not null,            -- MINT | SWAP | TRANSFER | COMPUTE | KILL_SWITCH
  amount bigint,                        -- In MIST
  from_token text,                      -- e.g. SUI
  to_token text,                        -- e.g. SUI
  target_protocol text,                 -- e.g. DeepBook, AnimaProtocol
  status text default 'success',        -- success | failed
  checkpoint bigint,                    -- Sui checkpoint number
  timestamp timestamptz default now()
);

-- 3. Protocol-wide global stats (single row dashboard accumulator)
create table if not exists protocol_stats (
  id int primary key default 1,         -- Always single row
  total_agents bigint default 0,
  total_active bigint default 0,
  total_paused bigint default 0,
  total_actions bigint default 0,
  total_volume bigint default 0,        -- Total SUI volume in MIST
  updated_at timestamptz default now(),
  constraint single_row_restriction check (id = 1)
);

-- Initialize protocol stats table row if not exists
insert into protocol_stats (id, total_agents, total_active, total_paused, total_actions, total_volume)
values (1, 0, 0, 0, 0, 0)
on conflict (id) do nothing;

-- 4. Enable Row Level Security (RLS)
alter table agents enable row level security;
alter table agent_actions enable row level security;
alter table protocol_stats enable row level security;

-- 5. Create Policies (Public Read Access)
create policy "Allow public read access on agents" 
  on agents for select 
  using (true);

create policy "Allow public read access on agent_actions" 
  on agent_actions for select 
  using (true);

create policy "Allow public read access on protocol_stats" 
  on protocol_stats for select 
  using (true);
