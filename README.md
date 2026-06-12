# ANIMA — Agent Native Identity & Machine Autonomy

> _Giving AI agents a soul on-chain. First-class agent identity, accountability, and autonomy on Sui._

[![Sui](https://img.shields.io/badge/Built%20on-Sui-4CA3DD?style=flat-square)](https://sui.io)
[![Walrus](https://img.shields.io/badge/Storage-Walrus-FF6B35?style=flat-square)](https://walrus.xyz)
[![Hackathon](https://img.shields.io/badge/Sui%20Overflow-2026-blueviolet?style=flat-square)](https://sui.io/overflow)
[![Track](https://img.shields.io/badge/Track-Agentic%20Web-green?style=flat-square)]()
[![University](https://img.shields.io/badge/Award-University-gold?style=flat-square)]()

---

## Table of Contents

- [What is ANIMA?](#what-is-anima)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Team & Ownership](#team--ownership)
- [Development Plan — 27 Days](#development-plan--27-days)
  - [Phase 1: Foundation (Days 1–7)](#phase-1-foundation-days-17)
  - [Phase 2: Core Build (Days 8–18)](#phase-2-core-build-days-818)
  - [Phase 3: Integration (Days 19–23)](#phase-3-integration-days-1923)
  - [Phase 4: Polish & Demo (Days 24–27)](#phase-4-polish--demo-days-2427)
- [Component Deep Dives](#component-deep-dives)
  - [Contracts — Joshua](#contracts--joshua)
  - [Agent Runtime — Ezekiel](#agent-runtime--ezekiel)
  - [Backend — Ademola](#backend--ademola)
  - [Explorer — Joshua](#explorer--joshua)
- [Demo Loop](#demo-loop)
- [Demo Day Checklist](#demo-day-checklist)
- [Tech Stack](#tech-stack)
- [Roadmap Beyond Hackathon](#roadmap-beyond-hackathon)

---

## What is ANIMA?

ANIMA is a native agent identity and autonomy protocol built on Sui. It allows humans to mint AI agents as **Non-Fungible Agents (NFAs)** — unique on-chain objects with their own sovereign wallet, skill registry, and immutable action history.

Agents reason and act off-chain, but every economic decision they execute is logged on-chain against their ANIMA identity — creating the first verifiable, accountable, autonomous agent layer on Sui.

---

## The Problem

AI agents are increasingly acting in crypto — trading, paying, executing. But today they are **stateless, unaccountable, and invisible**:

- Agents borrow human wallets — there is no agent identity
- When an agent acts, you cannot verify what agent did it, who owns it, or what it is authorized to do
- Protocols cannot trust agents they cannot identify
- DAOs cannot delegate to agents they cannot audit
- There is no kill switch — if an agent goes rogue, funds are gone

**There is no identity, accountability, or autonomy layer for agents on-chain today.**

---

## The Solution

ANIMA gives agents first-class citizenship on Sui. Each agent is minted as a unique ANIMA object containing:

- A **sovereign wallet** — completely independent from the human's wallet
- A **skill registry** — dynamic fields defining what the agent is authorized to do
- An **action history** — immutable log of every on-chain action, emitted as Sui events
- An **operational mode** — Normal (agent is live) or Paused (emergency kill switch triggered)
- A **reputation score** — derived from action history, updated on every execution

The human is a **guardian, not a controller.** During normal operation the human cannot touch the agent wallet. In an emergency they can trigger the kill switch, pause the agent, and drain funds back to their address.

> _Just like a human trader watches charts off-chain but the moment he executes a trade it logs on-chain — an ANIMA agent lives off-chain but acts on-chain with a verified identity._

---

## System Architecture

```
       ┌──────────────────────────────────────────────────────────────┐
       │                HUMAN GUARDIAN COMPONENT                      │
       │                                                              │
       │    ┌──────────────────┐         Emergency Kill Switch        │
       │    │  OwnerCap Object ├───────────────────────────────────┐  │
       │    └──────────────────┘                                   │  │
       └───────────────────────────────────────────────────────────┼──┘
                                                                   │
 ┌─────────────────────────────────────────────────────────────────┼──────┐
 │                      OFF-CHAIN AGENT RUNTIME                    │      │
 │                                                                 │      │
 │  ┌─────────────────────┐   V1 SUI Settlement   ┌───────────────▼────┐  │
 │  │    Data Engine      │◄──────────────────────┤  Backend Compute   │  │
 │  │ (Python/TS Predict) │  (Periodic Transfers) │   Tracking Layer   │  │
 │  └──────────┬──────────┘                       └────────────────────┘  │
 │             │ Trigger                                                   │
 │             ▼                                                           │
 │  ┌─────────────────────┐       Read Skills                              │
 │  │  Agent Orchestrator ├──────────────────────────┐                     │
 │  └──────────┬──────────┘                          │                     │
 └─────────────┼─────────────────────────────────────┼─────────────────────┘
               │                                     │
               │ Submits PTB                         │ Fetches from Walrus
               ▼                                     ▼
 ┌──────────────────────────────────────────┐  ┌──────────────────┐
 │               ON-CHAIN SUI               │  │      WALRUS      │
 │                                          │  │  (Skill Storage) │
 │  ┌────────────────────────────────────┐  │  │                  │
 │  │      ANIMA Identity Object         │  │  │  ┌────────────┐  │
 │  │  ┌──────────────────────────────┐  │  │  │  │ Skill JSON │  │
 │  │  │ Skill Registry (Dyn Fields)  ├──┼──┼─►│  │ & Weights  │  │
 │  │  └──────────────────────────────┘  │  │  │  └────────────┘  │
 │  │  ┌──────────────────────────────┐  │  │  └──────────────────┘
 │  │  │ Sovereign Agent Wallet       │  │  │
 │  │  └──────────────────────────────┘  │  │  ┌──────────────────┐
 │  │  ┌──────────────────────────────┐  │  │  │  ANIMA EXPLORER  │
 │  │  │ Operational Mode             │  │  │  │                  │
 │  │  │ (Normal / PAUSED)            │  │  │  │  Live event log  │
 │  │  └──────────────────────────────┘  │  │  │  Agent dashboard │
 │  │  ┌──────────────────────────────┐  │  │  │  Kill switch UI  │
 │  │  │ Reputation Score             │  │  │  └──────────────────┘
 │  │  └──────────────────────────────┘  │  │
 │  └────────────────────────────────────┘  │
 └──────────────────────────────────────────┘
```

---

## Repository Structure

```
anima-protocol/
│
├── contracts/                  # Sui Move smart contracts (Joshua)
│   ├── sources/
│   │   ├── anima.move          # Core ANIMA identity object
│   │   ├── skill_registry.move # Dynamic field skill management
│   │   ├── wallet.move         # Sovereign wallet logic
│   │   └── events.move         # All emitted event structs
│   ├── tests/
│   │   └── anima_tests.move
│   └── Move.toml
│
├── agent-runtime/              # Off-chain agent intelligence (Ezekiel)
│   ├── src/
│   │   ├── monitor.py          # Price monitoring loop
│   │   ├── predictor.py        # ML prediction model
│   │   ├── orchestrator.py     # Decision engine
│   │   └── walrus_client.py    # Walrus fetch/upload logic
│   ├── models/                 # Trained model weights
│   ├── config/
│   │   └── skill_schema.json   # Walrus skill config schema
│   └── requirements.txt
│
├── backend/                    # API + PTB execution layer (Ademola)
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── ptb/
│   │   │   └── executor.ts     # PTB builder and submitter
│   │   ├── deepbook/
│   │   │   └── swap.ts         # DeepBook integration
│   │   ├── events/
│   │   │   └── indexer.ts      # Sui event listener
│   │   └── routes/
│   │       └── agent.ts        # REST API routes
│   ├── package.json
│   └── tsconfig.json
│
├── explorer/                   # ANIMA Explorer frontend (Joshua)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing / search
│   │   │   └── agent/[id]/     # Agent profile page
│   │   ├── components/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── ActionFeed.tsx
│   │   │   ├── SkillBadge.tsx
│   │   │   ├── WalletPanel.tsx
│   │   │   └── KillSwitch.tsx
│   │   └── lib/
│   │       ├── sui.ts          # Sui client utils
│   │       └── walrus.ts       # Walrus fetch utils
│   ├── package.json
│   └── next.config.js
│
└── docs/
    ├── README.md               # This file
    ├── ARCHITECTURE.md         # Deep technical architecture
    ├── DEMO_SCRIPT.md          # Step by step demo day script
    └── SUBMISSION.md           # Hackathon submission write-up
```

---

## Team & Ownership

| Area                | Owner       | Responsibility                                                               |
| ------------------- | ----------- | ---------------------------------------------------------------------------- |
| Smart Contracts     | **Joshua**  | ANIMA Move object, OwnerCap, skill registry, wallet, events, PTB integration |
| Explorer Frontend   | **Joshua**  | Next.js explorer, agent dashboard, kill switch UI, event feed                |
| Backend & Execution | **Ademola** | PTB builder, DeepBook swap executor, Sui event indexer, REST API             |
| Agent Runtime & ML  | **Ezekiel** | Price monitor, prediction model, agent orchestrator, Walrus skill management |

---

## Development Plan — 27 Days

### Overview

```
Days  1– 7  │ Phase 1: Foundation    │ Setup, contracts scaffold, runtime scaffold
Days  8–18  │ Phase 2: Core Build    │ Each person builds their core component
Days 19–23  │ Phase 3: Integration   │ Connect everything end-to-end
Days 24–27  │ Phase 4: Polish & Demo │ UI polish, demo script, submission write-up
```

---

### Phase 1: Foundation (Days 1–7)

> Goal: Everyone has a working local environment and skeleton code. No blockers going into the core build.

#### Joshua — Contracts

- [x] Set up Sui Move project inside `/contracts` with `Move.toml`
- [x] Scaffold the `ANIMA` struct with all fields (id, name, reputation_score, is_paused, wallet_balance)
- [x] Scaffold the `OwnerCap` struct
- [x] Write the `mint_anima` entry function — human calls this, receives OwnerCap
- [x] Define all event structs in `events.move` (AgentActionExecuted, EmergencyHatchTriggered, ComputeSettled)
- [ ] Deploy scaffold to Sui testnet and confirm object creation works
- [ ] Share the deployed package ID with Ademola so he can start building against it

#### Ezekiel — Agent Runtime

- [ ] Set up Python project inside `/agent-runtime` with `requirements.txt`
- [ ] Write a basic price monitor loop that polls a token price every 30 seconds (CoinGecko API or similar free feed)
- [ ] Define the `skill_schema.json` — the JSON structure that will live on Walrus (skill name, trigger conditions, action type, parameters)
- [ ] Set up Walrus client — write functions to upload a JSON blob and retrieve it by blob ID
- [ ] Test a round trip: upload a skill config JSON to Walrus testnet, retrieve it, confirm integrity
- [ ] Document the schema clearly so Joshua can store the blob ID in the contract's skill registry

#### Ademola — Backend

- [ ] Set up TypeScript project inside `/backend` with `package.json`
- [ ] Install `@mysten/sui` SDK
- [ ] Write a basic Sui client connection and confirm you can read object state from testnet
- [ ] Set up a simple Express/Fastify REST API skeleton with a `/health` route
- [ ] Research DeepBook V3 SDK — understand the swap interface before building against it
- [ ] Set up a Sui event listener that subscribes to a package ID and logs events to console

---

### Phase 2: Core Build (Days 8–18)

> Goal: Every component works independently. Each person can demo their piece in isolation.

#### Joshua — Contracts (Days 8–14)

**Week focus: Complete the full contract with all functions**

- [x] Implement `skill_registry.move` — dynamic field management
  - `add_skill(anima, skill_name, walrus_blob_id)` — adds a skill to the registry
  - `remove_skill(anima, skill_name, cap)` — removes a skill, requires OwnerCap
  - `get_skill_blob_id(anima, skill_name)` — read-only, returns Walrus blob ID
- [x] Implement `wallet.move` — sovereign wallet logic
  - `deposit(anima, coin)` — anyone can deposit SUI into the agent wallet
  - `agent_transfer(anima, amount, recipient)` — agent authorized spending (called by backend)
  - `settle_compute(anima, amount, recipient)` — periodic compute cost settlement
- [x] Implement emergency kill switch in `anima.move`
  - `trigger_emergency_kill(anima, cap, ctx)` — pauses agent, drains wallet to sender
  - Guard all spending functions with `assert!(!agent.is_paused, EAgentIsPaused)`
- [x] Write Move tests in `/contracts/tests/` covering mint, deposit, kill switch, skill add/remove
- [ ] Run `sui move test` — all tests must pass
- [ ] Re-deploy updated contract to testnet, share new package ID

**Joshua — Explorer (Days 12–18, parallel)**

- [ ] Set up Next.js project inside `/explorer`
- [ ] Build the search page — input an ANIMA object ID, fetch and display agent data
- [ ] Build the agent profile page `/agent/[id]` showing:
  - Agent name, reputation score, operational mode (Normal / PAUSED)
  - Wallet balance
  - Skill registry list with Walrus blob IDs
  - Live action feed (events from the backend indexer)
- [ ] Build the Kill Switch button component — calls `trigger_emergency_kill` via wallet adapter
- [ ] Connect to Sui wallet (Sui Wallet or Slush) for the mint flow and kill switch

#### Ezekiel — Agent Runtime (Days 8–18)

**Week 1 focus (Days 8–12): Prediction engine**

- [ ] Build `predictor.py` — a simple ML model that takes price history as input and outputs a BUY / HOLD / SELL signal
  - Start simple: moving average crossover or a lightweight sklearn model
  - The model does not need to be sophisticated — it needs to be demonstrably autonomous
- [ ] Connect the price monitor output to the predictor input
- [ ] Log decisions to console clearly: `[ANIMA] Price: $0.42 | Signal: BUY | Confidence: 78%`

**Week 2 focus (Days 13–18): Orchestrator + Walrus**

- [ ] Build `orchestrator.py` — the decision loop
  - On startup: read ANIMA object from Sui, extract skill registry blob IDs
  - Fetch skill config JSON from Walrus using blob IDs
  - Load skill parameters (trigger price, action type, amount limits)
  - Run the monitor + predictor loop
  - When a trigger fires: call the backend API to execute the PTB
- [ ] Implement Walrus skill update — when a skill is retrained, upload new weights to Walrus, return new blob ID for Joshua to update on-chain
- [ ] Test the full off-chain loop: boot agent → fetch skills from Walrus → monitor price → trigger decision → call backend

#### Ademola — Backend (Days 8–18)

**Week 1 focus (Days 8–12): PTB executor**

- [ ] Build `ptb/executor.ts` — the core PTB builder
  - Takes: ANIMA object ID, action type, swap params
  - Builds a PTB that:
    1. Validates skill authorization against the ANIMA skill registry
    2. Executes the swap/transfer
    3. Emits the custom AgentActionExecuted
  - Signs and submits the PTB to Sui testnet
- [ ] Test PTB execution independently — confirm the transaction lands and the event is emitted

**Week 2 focus (Days 13–18): DeepBook + Event Indexer**

- [ ] Build `deepbook/swap.ts` — integrate DeepBook V3
  - Connect to a DeepBook pool on testnet
  - Execute a token swap using the agent wallet as the signer context
  - Return the swap result to the PTB executor
- [ ] Build `events/indexer.ts` — Sui event listener
  - Subscribe to AgentActionExecuted from the ANIMA package
  - Store events in memory (or a simple SQLite/JSON file for hackathon scope)
  - Expose a REST endpoint `GET /agent/:id/events` that the explorer polls
- [ ] Build `routes/agent.ts` — REST API routes
  - `POST /agent/execute` — triggered by Ezekiel's orchestrator, builds and submits PTB
  - `GET /agent/:id/events` — returns event history for the explorer
  - `GET /agent/:id/status` — returns current ANIMA object state

---

### Phase 3: Integration (Days 19–23)

> Goal: The full demo loop works end-to-end, even if rough around the edges.

This phase is the hardest. Everyone needs to be available and communicating daily.

#### Day 19–20: Connect Runtime to Backend

- Ezekiel's orchestrator calls `POST /agent/execute` on Ademola's backend
- Confirm the signal from the ML engine triggers a real PTB submission
- Debug any auth, serialization, or object ID issues

#### Day 21: Connect Backend to Explorer

- Explorer polls `GET /agent/:id/events` from Ademola's backend
- Confirm events appear in the live action feed in real time after a PTB lands
- Test the full visual loop: agent fires → PTB lands → explorer updates

#### Day 22: Connect Walrus to Runtime

- Ezekiel confirms the orchestrator boots correctly using a real Walrus blob ID from the ANIMA object's skill registry
- Joshua updates the deployed ANIMA object with a real Walrus blob ID for a test skill
- Confirm the agent fetches the correct skill config on startup

#### Day 23: Full End-to-End Test

- Run the complete demo loop from scratch as if it is demo day
- Human mints ANIMA on the explorer → funds the agent wallet → agent boots → fetches Walrus skills → monitors price → fires PTB → explorer shows the event
- Document every bug. Fix the critical ones. Log the rest.

---

### Phase 4: Polish & Demo (Days 24–27)

> Goal: The demo loop is bulletproof. The submission is complete. Everyone knows their part.

#### Day 24: UI Polish (Joshua)

- Explorer UI must look clean and intentional — not a default Next.js template
- Agent profile page should feel like a real block explorer
- Kill switch button should be visually prominent with a confirmation modal
- Make sure the live event feed updates without a page refresh (polling or websocket)

#### Day 25: Demo Script (Everyone)

- Write `docs/DEMO_SCRIPT.md` — the exact step-by-step script for demo day
- Assign who speaks for each part
- Practice the demo at least twice as a team
- Prepare answers for likely judge questions:
  - _"What stops the agent from spending everything?"_ → Skill registry authorization + kill switch
  - _"Why Sui specifically?"_ → PTBs, object model, parallel execution — this could only be built cleanly on Sui
  - _"What's the real-world use case?"_ → DeFi protocols need accountable agents, DAOs need delegatable execution

#### Day 26: Submission Write-Up (Joshua)

- Write `docs/SUBMISSION.md` covering:
  - Project summary (one paragraph)
  - Problem and solution
  - Technical architecture
  - Sui-native integrations (PTBs, dynamic fields, events, Walrus)
  - Team composition
  - Demo video link
  - Live deployment links (testnet)
  - Roadmap

#### Day 27: Buffer + Final Deploy

- Re-deploy contracts to testnet one final time
- Confirm explorer is live on Vercel
- Confirm backend is live (Railway, Render, or similar)
- Submit before the deadline with all links working
- Record the demo video if not already done

---

## Component Deep Dives

### Contracts — Joshua

The ANIMA smart contract is the foundation everything else builds on. It must be deployed and stable before the integration phase.

**Core Move Struct:**

```move
public struct ANIMA has key, store {
    id: UID,
    name: String,
    reputation_score: u64,
    is_paused: bool,
    wallet_balance: Balance<SUI>,
}

public struct OwnerCap has key, store {
    id: UID,
    anima_id: ID,
}
```

**Key design decisions to understand:**

The skill registry uses **dynamic fields** on the ANIMA object, not a vector inside the struct. This is intentional — dynamic fields allow skills to be added post-mint without touching the core struct. The key is the skill name (String), the value is the Walrus blob ID (String).

The wallet is a `Balance<SUI>` encapsulated inside the ANIMA struct. Only authorized Move functions can mutate it. The human cannot reach into the balance directly — only through the kill switch function which requires the OwnerCap.

**Emergency kill switch pattern:**

```move
public fun trigger_emergency_kill(
    agent: &mut ANIMA,
    cap: &OwnerCap,
    ctx: &mut TxContext
) {
    assert!(object::uid_to_inner(&agent.id) == cap.anima_id, EInvalidGuardianCertificate);
    agent.is_paused = true;
    let balance = balance::value(&agent.wallet_balance);
    let funds = coin::take(&mut agent.wallet_balance, balance, ctx);
    transfer::public_transfer(funds, tx_context::sender(ctx));
    event::emit(EmergencyHatchTriggered { ... });
}
```

---

### Agent Runtime — Ezekiel

The agent runtime is the brain of ANIMA. It runs off-chain continuously, monitoring markets and making autonomous decisions.

**Skill config JSON schema (stored on Walrus):**

```json
{
  "skill_name": "token_price_monitor",
  "version": "1.0",
  "trigger": {
    "type": "price_threshold",
    "token": "SUI",
    "condition": "below",
    "value": 0.4
  },
  "action": {
    "type": "swap",
    "from_token": "USDC",
    "to_token": "SUI",
    "amount_percentage": 10
  },
  "risk_limits": {
    "max_spend_per_action": 10,
    "daily_spend_cap": 50
  }
}
```

**Orchestrator loop logic:**

```
1. Boot → read ANIMA object ID from env
2. Fetch ANIMA object from Sui → extract skill blob IDs from dynamic fields
3. For each blob ID → fetch skill config JSON from Walrus
4. Start price monitor loop
5. On each tick → run predictor → check against skill trigger conditions
6. If trigger fires → validate against risk limits → POST to backend /agent/execute
7. Log result → update local state → continue loop
```

**Key constraint for Ezekiel:** The ML model does not need to be accurate. It needs to be demonstrably autonomous. A simple moving average crossover that fires reliably on testnet is better than a sophisticated model that never triggers during the demo.

---

### Backend — Ademola

The backend is the execution bridge between the off-chain runtime and the on-chain contracts.

**PTB structure for atomic swap + event:**

```typescript
const tx = new Transaction();

// Step 1: Validate skill authorization against ANIMA object
const [skillAuth] = tx.moveCall({
  target: `${PACKAGE_ID}::anima::verify_skill_auth`,
  arguments: [tx.object(animaObjectId), tx.pure(skillName)],
});

// Step 2: Execute swap on DeepBook
const [swapResult] = tx.moveCall({
  target: `${DEEPBOOK_PACKAGE}::pool::swap`,
  arguments: [...swapParams],
});

// Step 3: Emit ANIMA action event (this is what the explorer reads)
tx.moveCall({
  target: `${PACKAGE_ID}::events::emit_action`,
  arguments: [tx.object(animaObjectId), swapResult],
});

const result = await client.signAndExecuteTransaction({
  transaction: tx,
  signer,
});
```

**Key constraint for Ademola:** The PTB must be atomic. If the DeepBook swap fails, the event must not be emitted. This is guaranteed by Sui's PTB design — if any step fails the entire block rolls back. Test this failure case explicitly.

---

### Explorer — Joshua

The ANIMA Explorer is the product surface that makes everything visible to judges and users.

**Key pages:**

`/` — Search page. Input an ANIMA object ID or agent name. Display a preview card.

`/agent/[id]` — Agent profile. The main view. Shows:

- Agent name and status badge (ACTIVE / PAUSED)
- Reputation score with a visual indicator
- Wallet balance (live, polled every 10 seconds)
- Skill registry — list of skills with their Walrus blob IDs
- Live action feed — every PTB event emitted by this agent, newest first
- Kill Switch button (only enabled if the connected wallet holds the OwnerCap)

**Live event feed implementation:**
The explorer polls `GET /agent/:id/events` from Ademola's backend every 5 seconds. When a new event arrives, it animates into the top of the feed. This creates the "watching an agent trade live" experience that wins demo day.

---

## Demo Loop

The complete end-to-end demonstration sequence for judges:

```
1. Open the ANIMA platform
   → Human fills in agent name and skill parameters
   → Clicks "Mint ANIMA"
   → Wallet signs the transaction
   → ANIMA object created on Sui testnet
   → Human receives OwnerCap in their wallet

2. Fund the agent
   → Human sends SUI to the agent's sovereign wallet address
   → Explorer shows wallet balance update

3. Agent boots
   → Ezekiel's orchestrator reads ANIMA object from Sui
   → Fetches skill config JSON from Walrus via blob ID
   → Begins price monitoring loop

4. Agent pays for data feed
   → Backend settles a small compute cost on-chain
   → ComputeSettled event emitted and visible in explorer

5. Price trigger fires
   → Token price crosses the threshold defined in the skill config
   → Orchestrator calls POST /agent/execute on the backend

6. PTB executes atomically
   → Skill authorization validated
   → Swap executes on DeepBook
   → AgentActionExecuted emitted in the same transaction

7. Explorer updates live
   → New action appears at the top of the live feed
   → Wallet balance reflects the swap
   → Reputation score increments

8. Kill switch demo
   → Human clicks KILL SWITCH on the explorer
   → Confirmation modal appears
   → Human signs with OwnerCap wallet
   → Agent is paused
   → All remaining SUI drains back to human wallet
   → Explorer shows PAUSED status
```

---

## Demo Day Checklist

| Priority | Component            | Pass Condition                                                    |
| -------- | -------------------- | ----------------------------------------------------------------- |
| Critical | ANIMA Mint           | Human mints → receives OwnerCap → object visible on explorer      |
| Critical | Walrus Skill Fetch   | Agent boots → fetches skill JSON from Walrus → logs skill config  |
| Critical | PTB Atomic Execution | Price trigger → swap on DeepBook + event emitted in same tx       |
| Critical | Explorer Live Feed   | Event appears in explorer within 10 seconds of block confirmation |
| High     | Kill Switch          | Click → agent paused → funds drained to human wallet              |
| High     | Reputation Score     | Score increments after each successful agent action               |
| Medium   | Compute Settlement   | Backend logs compute cost → settles on-chain as SUI transfer      |
| Roadmap  | x402 Framing         | Mention in presentation as next evolution of the payment layer    |

---

## Tech Stack

| Layer            | Technology                                 |
| ---------------- | ------------------------------------------ |
| Smart Contracts  | Sui Move                                   |
| Atomic Execution | Sui Programmable Transaction Blocks (PTBs) |
| On-chain Events  | Sui Event System                           |
| Skill Storage    | Walrus (Sui)                               |
| On-chain Swaps   | DeepBook V3                                |
| Agent Runtime    | Python 3.11+                               |
| ML Model         | scikit-learn / custom                      |
| Backend          | TypeScript, Node.js                        |
| Sui SDK          | @mysten/sui                                |
| Explorer         | Next.js 14, TypeScript, Tailwind CSS       |
| Deployment       | Vercel (explorer), Railway (backend)       |

---

## Roadmap Beyond Hackathon

**V1 — Hackathon (Current)**
Human-created NFAs. One complete autonomous loop. Agent explorer live.

**V2 — Post Hackathon**

- Multi-skill agents with composable skill registries
- Agent-to-agent interactions and capability delegation
- Reputation scoring used by DeFi protocols for agent trust gating
- Developer SDK — `anima-sdk` for building on the NFA standard
- Agent marketplace — browse and deploy community-built agents

**V3 — INFAs (Intelligent Non-Fungible Agents)**
Agents that mint their own NFAs without human intervention. Agents spawning child agents with delegated capabilities. A fully autonomous agent economy where agents are economic actors in their own right.

---

_Sui Overflow 2026 — Agentic Web Track + Walrus Specialized Track + University Award_
_Team: Joshua · Ademola · Ezekiel_
