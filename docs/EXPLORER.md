# ANIMA Explorer — 5 Day Build & Deploy Plan

> _Owner: Joshua | Stack: Next.js 14, @mysten/dapp-kit, Supabase, Node.js Indexer_

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
│   │   └── agent/
│   │       ├── AgentHeader.tsx     # Name, status badge, object ID
│   │       ├── IdentityPanel.tsx   # Owner address, mint date, reputation
│   │       ├── WalletPanel.tsx     # Balance, total volume (read-only)
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
export const PACKAGE_ID = "0x..."; // Your deployed package ID
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

### Day 2 — Routing & Layout Scaffolding + Agent Profile Mockups

> Goal: Routing works from search lookup. Agent profile page renders all sections with mocked data.

#### Morning — Scaffolding & Routing (3–4 hours)

Set up dynamic routing for agent lookup `/agent/[id]`. Build helper functions to route searches and validate Sui address format before navigating.

**`SearchBar.tsx`** updates:

- Check if search input matches standard 64-character hex format (`0x...`).
- Route successfully to `/agent/[id]`.
- Implement responsive design for mobile lookups.

#### Afternoon — Agent Profile Layout (3–4 hours)

Build all agent profile components with **static mocked data**. Focus on layout, aesthetics, and structure, not real data yet.

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
- Reputation score (rendered with simple numerical component or micro-loading bar visualization)

**`WalletPanel.tsx`:**

- Current balance in SUI (explicitly displaying numeric SUI balance, polled every 10 seconds on real hook)
- Total lifetime volume (read-only)
- No interactive funding actions (as funding is handled by the Product Interface).

**`SkillRegistry.tsx`:**

- List of skills, each showing:
  - Skill name
  - Walrus blob ID (truncated, with copy button)
  - "View on Walrus ↗" external link (linking out to retrieve the JSON config blob)

**`ActionFeed.tsx`:**

- Table/list of actions, newest first
- Each row: tx type badge, amount, protocol, timestamp, tx digest linked to Sui explorer
- Empty state: "No actions yet — agent is monitoring"

**End of Day 2 checkpoint:**

- [ ] Search input validates and routes to `/agent/[id]`
- [ ] Static agent profile dashboard renders all sections correctly on different screen sizes
- [ ] SUI balance display placeholder is prominent on WalletPanel
- [ ] All Sui explorer links open correctly in new tabs

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

**`indexer/listener.ts`** — the core loop (use deterministic cursor polling, **not deprecated WebSocket subscriptions**):

```typescript
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { supabase } from "../lib/supabase";
import * as dotenv from "dotenv";

dotenv.config();

const PACKAGE_ID = process.env.PACKAGE_ID!;
const client = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl("testnet") });

async function startEventPollingIndexer() {
  console.log(
    "🚀 ANIMA event indexing engine started via deterministic polling...",
  );

  // Track cursor to prevent duplicate event ingestion
  let nextCursor: any = null;

  setInterval(async () => {
    try {
      const eventResponse = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::events::AgentActionExecuted` },
        cursor: nextCursor,
        order: "ascending",
      });

      if (eventResponse.data.length > 0) {
        console.log(
          `📡 Ingested ${eventResponse.data.length} new operational events.`,
        );

        for (const ev of eventResponse.data) {
          await handleAgentActionExecuted(ev);
        }

        // Advance cursor to prevent replaying events
        nextCursor = eventResponse.nextCursor;
      }
    } catch (error) {
      console.error("✖ Indexer polling cycle encountered an anomaly:", error);
    }
  }, 3000); // Poll every 3 seconds
}

startEventPollingIndexer();
```

**Why this approach?** WebSocket event subscriptions (`subscribeEvent`) were deprecated and removed from the Sui fullnode RPC because streaming sockets frequently drop under transaction load. **Deterministic cursor polling is rock-solid** — it's what Sui's official indexers use.

**`indexer/handlers.ts`** — parse and write:

```typescript
async function handleAgentActionExecuted(eventData: any) {
  // Extract typed variables from Move event payload
  const { agent_id, action_type, amount, target_protocol } =
    eventData.parsedJson;

  // Write action to Supabase
  await supabase.from("agent_actions").insert({
    agent_object_id: agent_id,
    tx_digest: eventData.id.txDigest,
    action_type: action_type,
    amount: amount,
    target_protocol: target_protocol,
    status: "success",
    checkpoint: eventData.checkpoint,
  });

  // Update global protocol stats
  const { data: stats } = await supabase
    .from("protocol_stats")
    .select("*")
    .eq("id", 1)
    .single();
  if (stats) {
    await supabase
      .from("protocol_stats")
      .update({
        total_actions: stats.total_actions + 1,
        total_volume: (stats.total_volume || 0) + (amount || 0),
        updated_at: new Date(),
      })
      .eq("id", 1);
  }

  // If kill switch event, pause the agent
  if (action_type === "KILL_SWITCH") {
    await supabase
      .from("agents")
      .update({ is_paused: true })
      .eq("object_id", agent_id);
  }
}
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

> Goal: Kill switch works live for authorized guardians. Home page shows real protocol stats. UI looks intentional.

#### Morning — Kill Switch (2–3 hours)

**`KillSwitch.tsx`** — only render button and confirmation UI if the connected wallet context holds the OwnerCap corresponding to the agent's ID:

```typescript
// Check: does connectedWallet own an object with type `${PACKAGE_ID}::protocol::OwnerCap`
// and anima_id matching the current agent?
// Use suiClient.getOwnedObjects() filtered by type

// If yes → show the active "⚡ TRIGGER EMERGENCY KILL" button
// If no → hide the button or display a locked/read-only indicator
```

**Kill switch confirmation modal:**

- Warning message: "This will permanently pause your agent and return all funds to your wallet."
- Two buttons: Cancel / Confirm & Sign
- On confirm → build and sign `trigger_emergency_kill` transaction
- On success → agent status updates to PAUSED, balance shows 0

#### Late Morning — UI Refinements (1 hour)

- Refine loading skeletons for the lookup page and agent profile.
- Verify polling tick intervals for `useAgent.ts` (polling every 10 seconds for the numeric SUI balance).
- Tweak the status badge animation (pulsing green dot for `ACTIVE`, static red dot for `PAUSED`).

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

Run the complete demo loop three times from scratch using a pre-minted agent:

```
1. Open explorer on live Vercel URL
2. Search for the pre-minted agent by object ID
3. Verify name, SUI balance, status, and active skills display correctly
4. Wait for Ezekiel's agent runtime to execute a swap/transfer action
5. Watch ActionFeed update live with transaction details (polled/ingested via backend indexer)
6. Connect wallet holding the OwnerCap for the agent
7. Verify that the "⚡ TRIGGER EMERGENCY KILL" button becomes active
8. Click Kill Switch → confirm modal → sign the transaction
9. Confirm agent status changes to PAUSED and numeric balance updates to 0 SUI
10. Confirm global stats updated on home page
```

Fix any bugs that surface during the runs.

#### Evening — Final Checks

- [ ] Live Vercel URL loads in under 3 seconds
- [ ] Wallet connects on first try
- [ ] Search input validates and routes correctly
- [ ] Agent profile loads real data (including SUI balance) within 2 seconds
- [ ] Kill switch works end-to-end for the OwnerCap holder
- [ ] ActionFeed shows events within 10 seconds of block confirmation
- [ ] All Sui Explorer links open correctly
- [ ] No console errors in production build
- [ ] Mobile layout is not broken

---

## Live URLs (fill in after deploy)

| Service              | URL                                           |
| -------------------- | --------------------------------------------- |
| Explorer (Vercel)    | `https://anima-explorer.vercel.app`           |
| Indexer (Railway)    | `https://anima-indexer.up.railway.app`        |
| Sui Testnet Explorer | `https://suiexplorer.com/?network=testnet`    |
| Supabase Dashboard   | `https://supabase.com/dashboard/project/[id]` |
| Contract Package ID  | `0x...`                                       |

---

## What Links to Sui Explorer vs What You Build

| Data                                | ANIMA Explorer | Sui Explorer |
| ----------------------------------- | -------------- | ------------ |
| Agent name, status, skills, balance | ✅ You build   | ❌           |
| Live action feed (agent-specific)   | ✅ You build   | ❌           |
| Kill switch UI                      | ✅ You build   | ❌           |
| Protocol global stats               | ✅ You build   | ❌           |
| Owner address detail                | Link out →     | ✅           |
| Transaction digest detail           | Link out →     | ✅           |
| OwnerCap object detail              | Link out →     | ✅           |
| Raw object JSON                     | Link out →     | ✅           |

---

## Key Dependencies on the Team

| Blocker                                     | Who                | When you need it                |
| ------------------------------------------- | ------------------ | ------------------------------- |
| Contract deployed + Package ID              | Joshua (contracts) | Before Day 3                    |
| `mint_anima` function signature confirmed   | Joshua (contracts) | Before Day 2 afternoon          |
| `trigger_emergency_kill` function signature | Joshua (contracts) | Before Day 4 morning            |
| Walrus blob ID format confirmed             | Ezekiel            | Before Day 2 afternoon          |
| Ademola's backend base URL                  | Ademola            | Before Day 4 (optional for MVP) |

---

## If Something Breaks on Demo Day

**Contract call fails:** Have a pre-minted ANIMA agent ready as a backup. Never demo a mint for the first time live.

**Indexer misses an event:** Have at least 5 pre-existing actions in Supabase from testing so the ActionFeed is never empty.

**Wallet won't connect:** Have a second browser with a different wallet adapter ready.

**Vercel is down:** Have `npm run dev` running locally as a backup on your laptop.

---

_ANIMA Explorer — Sui Overflow 2026_
_Owner: Joshua | 5 Day Build Target_

//NOTE [HIGHLY IMPORTANT!!!]:This is an addition to the prompt disregard the product interface in the plan and also this is important don't add the indexer folder in the explorer folder but it in the root folder
