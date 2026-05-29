# ANIMA Agent Runtime - Phase 1 Quick Reference

## 📂 File Structure

```
agent-runtime/
├── main.py                    ← Entry point (run this)
├── monitor.py                 ← Price monitoring (CoinGecko API)
├── walrus_client.py           ← Skill storage client
├── skill_schema.json          ← Skill config template
├── requirements.txt           ← Python dependencies
├── .env.template              ← Configuration template
├── test_phase1.py             ← Unit & integration tests
├── validate_phase1.py         ← Validation script
├── setup_phase1.py            ← Setup automation
├── README_PHASE1.md           ← Full documentation
└── PHASE1_EXECUTION_REPORT.md ← This execution report
```

---

## 🚀 Commands

### Setup
```bash
pip install -r requirements.txt
cp .env.template .env
```

### Run
```bash
python main.py                    # Start price monitor
```

### Test
```bash
pytest test_phase1.py -v          # Run all tests
pytest test_phase1.py -v -k "price"  # Run price monitor tests only
```

### Validate
```bash
python validate_phase1.py         # Validate setup
```

### Walrus Test
```bash
python -c "
import asyncio
from walrus_client import WalrusRoundTripTest
asyncio.run(WalrusRoundTripTest.run())
"
```

---

## 📚 Key Classes

### PriceMonitor
```python
from monitor import PriceMonitor

monitor = PriceMonitor(poll_interval=30)

# Get single price
price = await monitor.get_price("sui")
if price:
    print(f"SUI: ${price.price}")

# Get history
history = await monitor.get_price_history("sui", limit=10)

# Run continuously
await monitor.start()

# Stop
monitor.stop()
```

### WalrusClient
```python
from walrus_client import WalrusClient, SkillConfig

client = WalrusClient()

# Create skill
skill = SkillConfig(
    skill_name="my_skill",
    version="1.0",
    trigger={"type": "price_threshold", "value": 0.4},
    action={"type": "swap", "amount": 10},
    risk_limits={"max_spend": 10.0}
)

# Upload
blob_id = await client.upload_skill(skill)

# Retrieve
retrieved = await client.retrieve_skill(blob_id)

# Verify
is_valid = await client.verify_blob_integrity(blob_id)
```

### SkillConfig
```python
from walrus_client import SkillConfig

# Create
skill = SkillConfig(...)

# To JSON
json_str = skill.to_json()

# From JSON
skill = SkillConfig.from_json(json_str)
```

---

## 📊 Configuration

See `.env.template` for all options:

| Var | Default | Purpose |
|-----|---------|---------|
| PRICE_FEED_SOURCE | coingecko | Price data source |
| PRICE_POLL_INTERVAL | 30 | Seconds between polls |
| SUI_NETWORK | testnet | Sui network target |
| LOG_LEVEL | INFO | Logging verbosity |

---

## 🧪 Test Coverage

| Module | Tests | Status |
|--------|-------|--------|
| PriceData | 2 | ✅ |
| PriceMonitor | 6 | ✅ |
| SkillConfig | 3 | ✅ |
| WalrusClient | 5 | ✅ |
| Integration | 1 | ✅ |

Run: `pytest test_phase1.py -v`

---

## 💾 Expected Output

### Price Monitor
```
[2026-05-29 03:50:00,123] INFO - main - ============================================================
[2026-05-29 03:50:00,124] INFO - main - 🚀 ANIMA AGENT RUNTIME - PHASE 1
[2026-05-29 03:50:00,125] INFO - main - ============================================================

[2026-05-29 03:50:00,126] INFO - main - 📊 Starting price monitoring loop...
[2026-05-29 03:50:01,500] INFO - monitor - 🔄 Price monitor loop started (polling every 30s)
[2026-05-29 03:50:01,501] INFO - monitor - 📊 Poll #1
[2026-05-29 03:50:02,234] INFO - monitor - ✅ Price(sui: $0.42 @ 2026-05-29T03:50:02.123456)
```

### Walrus Round-Trip Test
```
============================================================
WALRUS ROUND-TRIP TEST
============================================================

📋 Test 1: Upload Skill Config
📤 Uploading skill 'token_price_monitor' to Walrus...
✅ Skill uploaded successfully!
   Blob ID: a1b2c3d4e5f6g7h8
   Size: 450 bytes

📋 Test 2: Retrieve Skill Config
📥 Retrieving skill from Walrus (blob_id: a1b2c3d4...)...
✅ Skill retrieved successfully!

📋 Test 3: Verify Integrity
✅ Integrity check passed for blob a1b2c3d4...

✅ ALL TESTS PASSED!
============================================================
```

---

## 🔗 Phase 1 → Phase 2 Integration

Phase 2 will import and use:

```python
# In predictor.py (Phase 2)
from monitor import PriceMonitor, PriceData

# In orchestrator.py (Phase 2)
from walrus_client import WalrusClient
from monitor import PriceMonitor
```

---

## ⚡ Common Tasks

### Add new token to monitor
Edit `monitor.py`, add to `TOKEN_ID_MAP`:
```python
TOKEN_ID_MAP = {
    "sui": "sui",
    "eth": "ethereum",
    "my_token": "my-token-coingecko-id",  # Add here
}
```

### Change polling interval
Via `.env`:
```
PRICE_POLL_INTERVAL=15
```

Or in code:
```python
monitor = PriceMonitor(poll_interval=15)
```

### Modify skill trigger
Edit `skill_schema.json`:
```json
{
  "trigger": {
    "type": "price_threshold",
    "token": "SUI",
    "condition": "below",
    "value": 0.35
  }
}
```

---

## 🐛 Troubleshooting

### Import Error: No module named 'aiohttp'
```bash
pip install -r requirements.txt
```

### CoinGecko API timeout
- Check internet connection
- API might be slow (wait 10s and retry)
- Check status at https://www.coingecko.com/

### Walrus test fails
- Check that `walrus_client.py` is in same directory
- Ensure Python 3.8+
- Check logs for detailed errors

### Port already in use (when Phase 2 backend runs)
- Change port in `.env` or code
- Kill existing process: `lsof -ti:3000 | xargs kill`

---

## 📞 Debug Tips

### Enable debug logging
Change `.env`:
```
LOG_LEVEL=DEBUG
```

### Test single component
```bash
# Test just monitor
pytest test_phase1.py::TestPriceMonitor -v

# Test just Walrus
pytest test_phase1.py::TestWalrusClient -v
```

### Print price history
```python
from monitor import PriceMonitor
import asyncio

async def debug():
    m = PriceMonitor()
    await m.get_price("sui")
    print(m.price_history)

asyncio.run(debug())
```

---

## ✅ Phase 1 Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Copy config: `cp .env.template .env`
- [ ] Run monitor: `python main.py` (should show prices)
- [ ] Run tests: `pytest test_phase1.py -v` (should pass 15+)
- [ ] Validate: `python validate_phase1.py` (should pass 5 checks)
- [ ] Test Walrus: Run round-trip test (should pass)

**If all checks pass**: Ready for Phase 2! 🚀

---

**Last Updated**: 2026-05-29  
**Phase Status**: ✅ COMPLETE
