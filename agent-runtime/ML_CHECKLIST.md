# ML & Agent Runtime Checklist

Based on the ANIMA protocol README, this checklist tracks all ML-related tasks for the agent runtime component.

---

## Phase 1: Foundation (Days 1–7)

### Price Monitoring System
- [ ] Set up Python project inside `/agent-runtime` with `requirements.txt`
- [ ] Write basic price monitor loop that polls token price every 30 seconds
  - [ ] Choose data source (CoinGecko API or similar free feed)
  - [ ] Implement polling logic
  - [ ] Add error handling and retry logic
  - [ ] Test polling locally with mock data
- [ ] Define `skill_schema.json` — JSON structure for skill configs on Walrus
  - [ ] Document: skill name, trigger conditions, action type, parameters
  - [ ] Include risk limits (max_spend_per_action, daily_spend_cap)
  - [ ] Create schema validation
- [ ] Set up Walrus client
  - [ ] Write function to upload JSON blob to Walrus testnet
  - [ ] Write function to retrieve blob by blob ID
  - [ ] Implement round-trip test: upload → retrieve → verify integrity
  - [ ] Document blob ID format for contract integration

---

## Phase 2: Core Build (Days 8–18)

### Week 1: ML Prediction Engine (Days 8–12)

#### `predictor.py` Development
- [ ] Design ML model architecture
  - [ ] Start simple: moving average crossover or lightweight sklearn model
  - [ ] Model must be demonstrably autonomous (not random)
  - [ ] Prioritize demo reliability over accuracy
- [ ] Implement prediction model
  - [ ] Accept price history as input
  - [ ] Output BUY / HOLD / SELL signal
  - [ ] Calculate confidence score (0-100%)
  - [ ] Add logging: `[ANIMA] Price: $0.42 | Signal: BUY | Confidence: 78%`
- [ ] Connect price monitor to predictor
  - [ ] Feed price history into predictor on each monitoring tick
  - [ ] Verify signal generation in console logs
  - [ ] Test with historical data (backtest if possible)
- [ ] Unit tests for prediction logic
  - [ ] Test edge cases (price gaps, null data, extreme values)
  - [ ] Test signal consistency (same input → same signal)

#### Model Management
- [ ] Create model storage structure in `/agent-runtime/models/`
  - [ ] Save trained model weights/pickle files
  - [ ] Version models (v1.0, v1.1, etc.)
  - [ ] Document model parameters and training data
- [ ] Implement model loading logic
  - [ ] Load weights on agent startup
  - [ ] Handle missing/corrupted model gracefully

---

### Week 2: Orchestrator & Skill Integration (Days 13–18)

#### `orchestrator.py` Development
- [ ] Build agent startup sequence
  - [ ] Read ANIMA object ID from environment variable or config
  - [ ] Fetch ANIMA object from Sui blockchain
  - [ ] Extract skill registry blob IDs from dynamic fields
  - [ ] Handle missing/invalid ANIMA objects
- [ ] Skill config fetching from Walrus
  - [ ] For each blob ID → fetch skill config JSON
  - [ ] Parse and validate skill structure
  - [ ] Log loaded skills on startup
  - [ ] Handle Walrus connection errors
- [ ] Core decision loop
  - [ ] Start price monitor
  - [ ] On each monitoring tick:
    - [ ] Run predictor with fresh price data
    - [ ] Check generated signal against skill trigger conditions
    - [ ] Validate against risk limits (max_spend, daily_cap)
    - [ ] If trigger fires → POST to backend `/agent/execute`
  - [ ] Log all decisions and trigger events
  - [ ] Continue loop gracefully after API calls
- [ ] Error handling & recovery
  - [ ] Reconnect to price data source on failure
  - [ ] Retry failed backend API calls with exponential backoff
  - [ ] Log failures without crashing
  - [ ] Graceful shutdown on SIGTERM/SIGINT

#### Walrus Skill Updates
- [ ] Implement model retraining workflow
  - [ ] When model is retrained: upload new weights/config to Walrus
  - [ ] Return new blob ID
  - [ ] Document process for manual skill updates
- [ ] Skill versioning
  - [ ] Track skill version in config JSON
  - [ ] Handle transitions between old/new skill versions
  - [ ] Validate backward compatibility

#### Integration Testing
- [ ] Full off-chain loop test (testnet)
  - [ ] Boot agent with real ANIMA object ID
  - [ ] Fetch skills from Walrus testnet
  - [ ] Monitor price for 5+ minutes
  - [ ] Confirm at least one trigger fires
  - [ ] Confirm backend API receives request
- [ ] Load testing
  - [ ] Monitor CPU/memory usage during price polling
  - [ ] Confirm no resource leaks over 1-hour runtime

---

## Phase 3: Integration (Days 19–23)

### Runtime ↔ Backend Connection
- [ ] Verify orchestrator calls `POST /agent/execute` correctly
  - [ ] Format request payload correctly
  - [ ] Handle 200/400/500 responses
  - [ ] Log all API interactions
- [ ] Test signal delivery end-to-end
  - [ ] Confirm ML signal → backend execution → PTB submission
  - [ ] Verify event appears in explorer within 10 seconds

### Walrus Integration
- [ ] Confirm orchestrator boots with real Walrus blob ID
  - [ ] Fetch skill config from deployed Walrus testnet
  - [ ] Validate config matches expected schema
- [ ] Test skill updates during runtime
  - [ ] Update skill on Walrus while agent is running
  - [ ] Confirm agent picks up new config on next cycle

### Full End-to-End Test
- [ ] Complete demo loop (Days 23)
  - [ ] Human mints ANIMA → funds wallet
  - [ ] Agent boots → fetches Walrus skills → monitors price
  - [ ] Price crosses threshold → PTB fires → event in explorer
  - [ ] Kill switch pauses agent → funds drain

---

## Phase 4: Polish & Demo (Days 24–27)

### Model & Algorithm Refinement
- [ ] Fine-tune trigger sensitivity
  - [ ] Adjust price thresholds to fire reliably during demo
  - [ ] Confirm no false positives (unnecessary trades)
- [ ] Optimize prediction speed
  - [ ] Ensure prediction completes in <100ms per tick
  - [ ] Profile for bottlenecks
- [ ] Documentation
  - [ ] Document model architecture and training approach
  - [ ] Create troubleshooting guide for runtime failures

### Demo Preparation
- [ ] Prepare demo-day price trigger
  - [ ] Use predictable, testnet price feed
  - [ ] Ensure trigger fires within 5 minutes of demo start
- [ ] Create demo script for ML component
  - [ ] Show price monitor updating
  - [ ] Show prediction signal generation
  - [ ] Show orchestrator triggering backend call
- [ ] Prepare for Q&A
  - [ ] Answer: _"Is the model actually predicting or just rule-based?"_ → Explain architecture
  - [ ] Answer: _"How reliable is the agent?"_ → Show consistency over test runs

### Final Deployment
- [ ] Deploy agent runtime to staging environment
- [ ] Run 24-hour continuous monitoring test
- [ ] Confirm no crashes or memory leaks
- [ ] Final price data feed validation

---

## Key ML Constraints & Notes

### Demonstration Priority Over Accuracy
- **The ML model does NOT need to be accurate.** It needs to be demonstrably autonomous.
- A simple moving average crossover that fires reliably > a sophisticated model that never triggers
- Optimize for demo day: reliable trigger that fires in <5 minutes

### Skill Config Schema (Walrus)
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

### Critical Dependencies
- **Sui Client**: Fetch ANIMA object & skill blob IDs
- **Walrus Client**: Download skill configs
- **Price Data Feed**: CoinGecko API or equivalent
- **Backend REST API**: Submit execute requests to `/agent/execute`

### Testing Checklist
- [ ] Unit tests for predictor (edge cases, consistency)
- [ ] Unit tests for orchestrator (startup, error recovery)
- [ ] Integration tests with testnet ANIMA object
- [ ] Integration tests with testnet Walrus
- [ ] Load tests (CPU/memory over 1+ hour)
- [ ] Demo-day dry-run (end-to-end with real systems)

---

## Success Criteria

✅ **Critical for Demo Day:**
1. Price monitor runs continuously without crashing
2. ML predictor generates consistent BUY/HOLD/SELL signals
3. Orchestrator fetches skills from Walrus and respects trigger conditions
4. Backend `/agent/execute` is called with correct payload on trigger
5. Agent can be paused via kill switch without orphaning processes

✅ **Nice to Have:**
1. Model achieves >60% directional accuracy on historical data
2. Agent runs for 24+ hours without memory leaks
3. Retraining workflow is fully automated

---

## Ownership & Contact
- **Owner**: Ezekiel
- **Related Components**: Backend (Ademola), Contracts (Joshua), Explorer (Joshua)
- **Sync Points**: Daily standup during Phases 2–3, specific integration tests on Days 19–23
