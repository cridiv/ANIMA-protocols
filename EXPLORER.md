# ANIMA Explorer — 5 Day Build & Deploy Plan
> *Owner: Joshua | Stack: Next.js 14, @mysten/dapp-kit, Supabase, Node.js Indexer*

---

## Overview

The ANIMA Explorer is two things in one:
- **Product interface** — where humans mint, fund, and manage their ANIMA agents
- **Block explorer** — where anyone can look up any agent by address and see its full autonomous history

It is the only product surface judges interact with directly on demo day. It must work perfectly.

---

## Prerequisites Before Day 1

These must be true before you write a single line of explorer code:

- [ ] Contract deployed to Sui testnet — you have a live **Package ID**
- [ ] You know the exact function signatures: `mint_anima`, `trigger_emergency_kill`, `add_skill`
- [ ] Supabase project created — you have the **URL** and **anon key**
- [ ] Ademola's backend is reachable at a base URL (even locally for now)
- [ ] Node.js 18+ installed

If the contract is not deployed yet, you can still complete Day 1 and most of Day 2 with mocked data. But do not go past Day 3 without a live package ID.

---

## Supabase Schema

Set this up before Day 1. This is the shared contract between your indexer and your frontend.

```sql
-- All minted ANIMA agents
create table agents (
  id uuid default gen_random_uuid() primary key,
  object_id text unique not null,       -- ANIMA object ID on Sui
  name text not null,                   -- Agent name
  owner_address text not null,          -- Address holding the OwnerCap
  owner_cap_id text not null,           -- OwnerCap object ID
  is_paused boolean default false,      -- Operational mode
  reputation_score bigint default 0,    -- On-chain reputation
  wallet_balance bigint default 0,      -- In MIST (1 SUI = 1_000_000_000 MIST)
  created_at timestamptz default now(),
  minted_at_checkpoint bigint           -- Sui checkpoint at mint
);

-- Every on-chain action the agent has taken
create table agent_actions (
  id uuid default gen_random_uuid() primary key,
  agent_object_id text not null references agents(object_id),
  tx_digest text unique not null,       -- Sui transaction hash
  action_type text not null,            -- SWAP | TRANSFER | COMPUTE | SKILL_ADD | KILL_SWITCH
  amount bigint,                        -- In MIST
  from_token text,                      -- e.g. USDC
  to_token text,                        -- e.g. SUI
  target_protocol text,                 -- e.g. DeepBook
  status text default 'success',        -- success | failed
  checkpoint bigint,                    -- Sui checkpoint number
  timestamp timestamptz default now()
);

-- Protocol-wide global stats (single row, updated on each event)
create table protocol_stats (
  id int primary key default 1,         -- Always one row
  total_agents bigint default 0,
  total_active bigint default 0,
  total_paused bigint default 0,
  total_actions bigint default 0,
  total_volume bigint default 0,        -- Total SUI volume in MIST
  updated_at timestamptz default now()
);

-- Insert the single stats row
insert into protocol_stats (id) values (1);
```

Enable **Row Level Security** on all tables but allow public read access — your explorer reads without auth.

---

## Repository Structure

```
explorer/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, wallet provider wrapper
│   │   ├── page.tsx                # Home — search + global stats
│   │   ├── mint/
│   │   │   └── page.tsx            # Mint a new ANIMA agent
│   │   └── agent/
│   │       └── [id]/
│   │           └── page.tsx        # Agent profile page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top nav with wallet connect button
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── SearchBar.tsx       # Search by agent address
│   │   │   ├── ProtocolStats.tsx   # Global TVL, total agents, total actions
│   │   │   └── AgentGrid.tsx       # Grid of recently minted agents
│   │   ├── mint/
│   │   │   ├── MintForm.tsx        # Agent name + skill params input
│   │   │   └── MintSuccess.tsx     # Post-mint confirmation with object ID
│   │   └── agent/
│   │       ├── AgentHeader.tsx     # Name, status badge, object ID
│   │       ├── IdentityPanel.tsx   # Owner address, mint date, reputation
│   │       ├── WalletPanel.tsx     # Balance, total volume, fund button
│   │       ├── SkillRegistry.tsx   # Dynamic skill list with Walrus blob IDs
│   │       ├── ActionFeed.tsx      # Live paginated action history
│   │       ├── KillSwitch.tsx      # Emergency kill switch button + modal
│   │       └── ActionRow.tsx       # Single row in the action feed
├── lib/
│   ├── sui.ts                      # Sui client, helper functions
│   ├── supabase.ts                 # Supabase client
│   ├── constants.ts                # Package ID, network, contract addresses
│   └── utils.ts                    # Format SUI amounts, truncate addresses etc
├── hooks/
│   ├── useAgent.ts                 # Fetch and poll agent object state from Sui
│   ├── useAgentActions.ts          # Fetch action history from Supabase
│   └── useProtocolStats.ts         # Fetch global stats from Supabase
├── indexer/                        # Node.js event listener (separate process)
│   ├── index.ts                    # Entry point
│   ├── listener.ts                 # Sui event subscription
│   ├── handlers.ts                 # Parse events and write to Supabase
│   └── package.json
├── package.json
└── next.config.js
```

---

## Day-by-Day Plan

---

### Day 1 — Project Setup + Home Page
> Goal: App runs locally, wallet connects, home page renders with mocked data

#### Morning — Project Setup (3–4 hours)

```bash
# Inside /explorer
npx create-next-app@latest . --typescript --tailwind --app
npm install @mysten/dapp-kit @mysten/sui @tanstack/react-query
npm install @supabase/supabase-js
```

**`lib/constants.ts`** — your single source of truth:
```typescript
export const PACKAGE_ID = "0x...";         // Your deployed package ID
export const NETWORK = "testnet";
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

**`lib/sui.ts`** — Sui client setup:
```typescript
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
export const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
```

**`lib/supabase.ts`** — Supabase client:
```typescript
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**`app/layout.tsx`** — wrap everything in the wallet provider:
```typescript
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
```

#### Afternoon — Home Page (3–4 hours)

Build these components with **mocked data first**, wire to real data on Day 3:

- `SearchBar.tsx` — input field, on submit navigate to `/agent/[id]`
- `ProtocolStats.tsx` — display: Total Agents, Active Agents, Total Actions, Total Volume
- `AgentGrid.tsx` — grid of recently minted agent cards (name, status, balance, mint date)
- `Navbar.tsx` — logo left, `ConnectButton` from dapp-kit right

**End of Day 1 checkpoint:**
- [ ] `npm run dev` runs with no errors
- [ ] Wallet connects successfully on testnet
- [ ] Home page renders with mocked stats and agent cards
- [ ] Search navigates to `/agent/0xmocked`

---

### Day 2 — Mint Page + Agent Profile Layout
> Goal: Mint flow works end-to-end. Agent profile page renders all sections with mocked data.

#### Morning — Mint Page (3–4 hours)

**`app/mint/page.tsx`** — the mint flow:

```typescript
// Rough structure — implement the logic yourself
const { mutate: signAndExecute } = useSignAndExecuteTransaction();

function handleMint() {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::anima::mint_anima`,
    arguments: [tx.pure.string(agentName)],
  });
  signAndExecute({ transaction: tx }, {
    onSuccess: (result) => {
      // Extract ANIMA object ID from result
      // Redirect to /agent/[newObjectId]
    }
  });
}
```

**`MintForm.tsx`** fields:
- Agent name (text input)
- Initial skill name (text input) 
- Walrus blob ID for skill (text input — Ezekiel provides this)
- Submit button — disabled until wallet is connected

**`MintSuccess.tsx`:**
- Shows new ANIMA object ID
- Shows OwnerCap object ID
- "View your agent →" link to `/agent/[id]`
- "Copy agent address" button

#### Afternoon — Agent Profile Layout (3–4 hours)

Build all agent profile components with **static mocked data**. Focus on layout and structure, not real data yet.

**`AgentHeader.tsx`:**
```
ANIMA: "Atlas"                    ● ACTIVE
0x1a2b3c...4d5e  [Copy] [View on Sui Explorer ↗]
Minted: May 27, 2026  |  Rep Score: 142
```

**`IdentityPanel.tsx`:**
- Owner address → links to `https://suiexplorer.com/address/[ownerAddress]?network=testnet`
- OwnerCap ID → links to Sui explorer
- Mint date
- Reputation score

**`WalletPanel.tsx`:**
- Current balance in SUI (converted from MIST)
- Total lifetime volume
- "Fund Agent" button → opens a simple modal to send SUI to agent wallet address

**`SkillRegistry.tsx`:**
- List of skills, each showing:
  - Skill name
  - Walrus blob ID (truncated, with copy button)
  - "View on Walrus ↗" external link

**`ActionFeed.tsx`:**
- Table/list of actions, newest first
- Each row: tx type badge, amount, protocol, timestamp, tx digest linked to Sui explorer
- Empty state: "No actions yet — agent is monitoring"

**End of Day 2 checkpoint:**
- [ ] Mint form renders and wallet signs the transaction
- [ ] After mint, user is redirected to the agent profile page
- [ ] All agent profile sections render with mocked data
- [ ] All Sui explorer links open correctly

---

### Day 3 — Wire Real Data + Indexer
> Goal: Agent profile shows real on-chain data. Indexer is running and writing to Supabase.

#### Morning — Wire Sui RPC to Agent Profile (3 hours)

**`hooks/useAgent.ts`** — polls Sui RPC every 10 seconds:

```typescript
// Hint: use suiClient.getObject() with showContent: true
// Poll with setInterval inside useEffect
// Return: name, is_paused, reputation_score, wallet_balance, owner
```

**`hooks/useAgentActions.ts`** — reads from Supabase:
```typescript
// supabase.from('agent_actions')
//   .select('*')
//   .eq('agent_object_id', agentId)
//   .order('timestamp', { ascending: false })
//   .limit(50)
```

Wire these hooks into `AgentHeader`, `WalletPanel`, `IdentityPanel`, and `ActionFeed`.

#### Afternoon — Node.js Indexer (3–4 hours)

Build this inside `/indexer`:

```bash
cd indexer
npm init -y
npm install @mysten/sui @supabase/supabase-js dotenv
```

**`indexer/listener.ts`** — the core loop:

```typescript
// Hint: use suiClient.subscribeEvent() or poll suiClient.queryEvents()
// Filter by: { MoveEventType: `${PACKAGE_ID}::events::AgentActionEvent` }
// On each event → call handler
```

**`indexer/handlers.ts`** — parse and write:

```typescript
// Parse the event fields (agent_id, action_type, amount, tx_digest etc)
// Write to Supabase agent_actions table
// Update protocol_stats row (increment total_actions, total_volume)
// If action_type is KILL_SWITCH → update agents.is_paused = true
```

Run the indexer locally:
```bash
npx ts-node indexer/index.ts
```

Trigger a test transaction on testnet and confirm the event appears in Supabase.

**End of Day 3 checkpoint:**
- [ ] Agent profile shows real balance, real name, real operational mode from Sui RPC
- [ ] Indexer is running locally and writing events to Supabase
- [ ] At least one real event is visible in the ActionFeed

---

### Day 4 — Kill Switch + Global Stats + Polish
> Goal: Kill switch works live. Home page shows real protocol stats. UI looks intentional.

#### Morning — Kill Switch (2–3 hours)

**`KillSwitch.tsx`** — only render if connected wallet holds the OwnerCap:

```typescript
// Check: does connectedWallet own an object with type `${PACKAGE_ID}::anima::OwnerCap`
// and anima_id matching the current agent?
// Use suiClient.getOwnedObjects() filtered by type

// If yes → show the kill switch button
// If no → render nothing (or a locked state)
```

**Kill switch confirmation modal:**
- Warning message: "This will permanently pause your agent and return all funds to your wallet."
- Two buttons: Cancel / Confirm & Sign
- On confirm → build and sign `trigger_emergency_kill` transaction
- On success → agent status updates to PAUSED, balance shows 0

#### Late Morning — Fund Agent Modal (1 hour)

Simple modal on `WalletPanel.tsx`:
- Input: amount in SUI
- On submit → `tx.transferObjects` to agent wallet address
- On success → balance updates on next poll

#### Afternoon — Global Stats + Home Page Real Data (2 hours)

**`hooks/useProtocolStats.ts`:**
```typescript
// supabase.from('protocol_stats').select('*').eq('id', 1).single()
```

Wire into `ProtocolStats.tsx` — replace mocked numbers with real ones.

**`AgentGrid.tsx`** — real recently minted agents:
```typescript
// supabase.from('agents').select('*').order('created_at', { ascending: false }).limit(12)
```

#### Evening — UI Polish (2 hours)

- Status badge: green pulsing dot for ACTIVE, red static dot for PAUSED
- Action type badges: color coded (SWAP = blue, TRANSFER = green, KILL_SWITCH = red)
- Loading skeletons on all data-fetching components
- Empty states on ActionFeed and AgentGrid
- Mobile responsive layout check
- All external links open in new tab

**End of Day 4 checkpoint:**
- [ ] Kill switch signs transaction, agent shows PAUSED after confirmation
- [ ] Home page shows real protocol stats from Supabase
- [ ] Fund agent modal sends real SUI to agent wallet
- [ ] UI has no obvious placeholder text or broken layouts

---

### Day 5 — Deploy + Demo Prep
> Goal: Everything is live on public URLs. Demo loop runs perfectly.

#### Morning — Deploy Explorer to Vercel (2 hours)

```bash
# Push to GitHub first
git add . && git commit -m "feat: anima explorer v1"
git push

# Deploy via Vercel CLI or Vercel dashboard
npx vercel --prod
```

Set environment variables in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_PACKAGE_ID=
NEXT_PUBLIC_NETWORK=testnet
```

Confirm the live URL works and wallet connects on testnet.

#### Late Morning — Deploy Indexer (2 hours)

Deploy the Node.js indexer to Railway:

```bash
# In /indexer
# Add a Procfile or railway.json
# railway up
```

Set environment variables on Railway:
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=       ← use service key here, not anon key
PACKAGE_ID=
NETWORK=testnet
```

Confirm the indexer is running on Railway and events are still flowing into Supabase.

#### Afternoon — Full Demo Run (3 hours)

Run the complete demo loop three times from scratch:

```
1. Open explorer on live Vercel URL
2. Connect wallet (fresh wallet with testnet SUI)
3. Go to /mint
4. Fill in agent name and skill
5. Click Mint → sign transaction
6. Confirm redirect to /agent/[id]
7. Fund agent wallet via Fund modal
8. Wait for Ezekiel's agent to boot and trigger an action
9. Watch ActionFeed update live
10. Click Kill Switch → confirm modal → sign
11. Confirm agent shows PAUSED, balance shows 0
12. Search for the agent from home page by object ID
13. Confirm global stats updated
```

Fix any bugs that surface during the runs.

#### Evening — Final Checks

- [ ] Live Vercel URL loads in under 3 seconds
- [ ] Wallet connects on first try
- [ ] Mint transaction confirms within 5 seconds on testnet
- [ ] Agent profile loads real data within 2 seconds
- [ ] Kill switch works end-to-end
- [ ] ActionFeed shows events within 10 seconds of block confirmation
- [ ] All Sui Explorer links open correctly
- [ ] No console errors in production build
- [ ] Mobile layout is not broken

---

## Live URLs (fill in after deploy)

| Service | URL |
|---|---|
| Explorer (Vercel) | `https://anima-explorer.vercel.app` |
| Indexer (Railway) | `https://anima-indexer.up.railway.app` |
| Sui Testnet Explorer | `https://suiexplorer.com/?network=testnet` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/[id]` |
| Contract Package ID | `0x...` |

---

## What Links to Sui Explorer vs What You Build

| Data | ANIMA Explorer | Sui Explorer |
|---|---|---|
| Agent name, status, skills, balance | ✅ You build | ❌ |
| Live action feed (agent-specific) | ✅ You build | ❌ |
| Kill switch UI | ✅ You build | ❌ |
| Protocol global stats | ✅ You build | ❌ |
| Owner address detail | Link out → | ✅ |
| Transaction digest detail | Link out → | ✅ |
| OwnerCap object detail | Link out → | ✅ |
| Raw object JSON | Link out → | ✅ |

---

## Key Dependencies on the Team

| Blocker | Who | When you need it |
|---|---|---|
| Contract deployed + Package ID | Joshua (contracts) | Before Day 3 |
| `mint_anima` function signature confirmed | Joshua (contracts) | Before Day 2 afternoon |
| `trigger_emergency_kill` function signature | Joshua (contracts) | Before Day 4 morning |
| Walrus blob ID format confirmed | Ezekiel | Before Day 2 afternoon |
| Ademola's backend base URL | Ademola | Before Day 4 (optional for MVP) |

---

## If Something Breaks on Demo Day

**Contract call fails:** Have a pre-minted ANIMA agent ready as a backup. Never demo a mint for the first time live.

**Indexer misses an event:** Have at least 5 pre-existing actions in Supabase from testing so the ActionFeed is never empty.

**Wallet won't connect:** Have a second browser with a different wallet adapter ready.

**Vercel is down:** Have `npm run dev` running locally as a backup on your laptop.

---

*ANIMA Explorer — Sui Overflow 2026*
*Owner: Joshua | 5 Day Build Target*
