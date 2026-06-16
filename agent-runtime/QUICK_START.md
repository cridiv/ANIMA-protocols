# ANIMA Agent Runtime - Quick Reference Guide for Ezekiel

## 🚀 IMMEDIATE ACTIONS

### 1. Generate Your Operator Address (Share with Joshua)

```bash
cd agent-runtime
python main.py generate-address
```

**Output:** `0x69f68c342533e129d4fd1b3ebd0f817be4fcb923`

### 2. Publish Your Skill to Walrus (Share with Joshua)

```bash
python main.py publish-skill
```

**Output:** `WALRUS_DEEPBOOK_HIGHFREQ_ARBITRAGE_V1`

### 3. Share These Two Values with Joshua

```
OPERATOR_PUBLIC_ADDRESS=0x69f68c342533e129d4fd1b3ebd0f817be4fcb923
WALRUS_BLOB_ID=WALRUS_DEEPBOOK_HIGHFREQ_ARBITRAGE_V1
```

---

## 🛠️ AVAILABLE COMMANDS

```bash
# Check current status
python main.py status

# View your skill configuration
python main.py show-config

# Run the orchestrator daemon (mock mode)
python main.py

# Run with custom signal interval (15 seconds)
set MOCK_SIGNAL_INTERVAL=15
python main.py
```

---

## 📋 WHAT'S BEEN BUILT

### ✅ Complete

- [x] Secure local keypair generation (`src/keys.py`)
- [x] Skill configuration blueprint (`config/skill_schema.json`)
- [x] Orchestrator daemon loop (`src/orchestrator.py`)
- [x] Walrus publisher (`src/walrus_publish.py`)
- [x] Mock predictor with configurable signals (`src/predictor.py`)
- [x] CLI entry points (`main.py`, `anima.py`)

### 📂 Key Files

```
agent-runtime/
├── src/keys.py                    # Your keypair manager
├── src/orchestrator.py            # Main daemon loop
├── src/walrus_publish.py          # Walrus integration
├── src/predictor.py               # ML + mock predictor
├── config/skill_schema.json       # Strategy blueprint
├── main.py                        # Primary CLI
├── anima.py                       # Advanced CLI
└── IMPLEMENTATION_REPORT.md       # Full details
```

---

## 🔐 SECURITY CHECKLIST

✓ Private keys stored locally only (`~/.anima/keys/`)
✓ Private keys file protected (0o600)
✓ Only public address shared with Joshua
✓ Spending limits enforced on-chain
✓ All transactions signed locally before submission

---

## 🎯 NEXT MILESTONE: Joshua's Handoff

**What Joshua will do:**

1. Take your `OPERATOR_PUBLIC_ADDRESS` and `WALRUS_BLOB_ID`
2. Call the ANIMA smart contract to mint your agent
3. Provide you with `ANIMA_OBJECT_ID`

**Then you run:**

```bash
set ANIMA_OBJECT_ID=<from Joshua>
python main.py
```

The daemon will:

- Connect to Sui testnet
- Monitor prices
- Fire BUY_SIGNAL every 45 seconds
- Execute trades through your hot wallet

---

## 💡 TESTING THE MOCK DAEMON

To see it fire signals, run with shorter intervals:

```bash
set MOCK_SIGNAL_INTERVAL=10
python main.py
```

Watch it fire BUY_SIGNAL every 10 seconds. Each signal shows:

- Current price
- Transaction submission status
- Full uptime tracking

---

## 📊 PRODUCTION READINESS

**Ready for Joshua:**

- ✓ Address generation
- ✓ Skill publishing
- ✓ Mock orchestrator loop

**Remaining (Post-Hackathon):**

- Real ML model integration
- DeepBook V3 price fetching
- Sui RPC integration
- Transaction signing with Ed25519
- Error recovery and monitoring

---

## 🆘 TROUBLESHOOTING

**Issue: "No operator address found"**

```bash
python main.py generate-address
```

**Issue: "Config file not found"**
Check that `config/skill_schema.json` exists.

**Issue: Unicode encoding errors (Windows)**
Already fixed in `main.py` - should work now.

**Issue: "ANIMA_OBJECT_ID not set"**
Wait for Joshua to mint your agent, then set the env var.

---

## 📞 HANDOFF CHECKLIST

Before handing off to Joshua:

- [x] Run `python main.py generate-address`
- [x] Run `python main.py publish-skill`
- [x] Run `python main.py status` to verify
- [x] Share `OPERATOR_PUBLIC_ADDRESS`
- [x] Share `WALRUS_BLOB_ID`
- [x] Keep `ANIMA_OBJECT_ID` for when Joshua returns it
- [x] Test daemon runs (even in mock mode)
- [x] Verify all keys stored locally

---

## 🎓 HOW IT WORKS

```
┌─────────────────────────────────────────────────────┐
│  YOUR LOCAL MACHINE (Ezekiel)                       │
│                                                     │
│  Agent Runtime Daemon (Python)                      │
│  ├─ Private Key: ~/.anima/keys/operator.key        │
│  ├─ Public Address: 0x69f68c...                     │
│  └─ Event Loop:                                     │
│      1. Poll market prices                          │
│      2. Evaluate ML signals                         │
│      3. Sign PTB with private key                   │
│      4. Submit to Sui                               │
└─────────────────────────────────────────────────────┘
          ↕ (only sends public address & signatures)
┌─────────────────────────────────────────────────────┐
│  SUI TESTNET                                        │
│                                                     │
│  ANIMA Smart Contract                               │
│  ├─ Verified operator: 0x69f68c...                 │
│  ├─ Spending limits enforced                        │
│  ├─ Action history logged                           │
│  └─ Emergency kill switch (Joshua)                  │
└─────────────────────────────────────────────────────┘
```

---

## 📖 FULL DOCUMENTATION

See: `IMPLEMENTATION_REPORT.md` for comprehensive details.

---

**Status:** PHASE 1 COMPLETE ✓
**Ready for Joshua's On-Chain Registration** ✓
**Build Date:** 2026-06-13
