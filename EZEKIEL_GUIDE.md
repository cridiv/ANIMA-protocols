# ANIMA Agent Runtime Framework — Engineering & Integration Directive

> **Target Audience:** Ezekiel (ML & Off-Chain Runtime Lead)  
> **Ecosystem Scope:** Off-Chain Brain Setup, Local Cryptographic Key Isolation, Walrus & Sui Handshake Loop  
> **Timeline Priority:** Critical Path Lifecycle Integration (9-Day Crunch Window)

---

## 1. Executive Summary & Architectural Shift

Ezekiel, we have completely locked down the core on-chain identity framework for **ANIMA**. To maximize security, protect user funds, and win the **Agentic Web** track, we are officially enforcing the **Shared Object & Hot-Wallet Relayer Pattern**.

### ⚠️ The Golden Rule of Key Management



```text
agent-runtime/
├── src/
│   ├── keys.py          # Local keypair generation and secure file-system locking
│   ├── walrus.py        # Streamlined upload/fetch mechanics to Walrus Testnet
│   ├── monitor.py       # High-frequency data engine & market polling loops
│   ├── predictor.py     # Inference layer / autonomous decision strategy execution
│   └── orchestrator.py  # Central daemon loop managing identity synchronization
├── config/
│   └── skill_schema.json # Strategy parameter boundary definitions
├── requirements.txt     # Locked production python dependencies
└── .env.example         # Template for strictly local key records
```

---

### Step 1: Secure Local Key Generation (src/keys.py)

Your runtime must handle keypair generation using pysui or standard cryptography primitives. On script initialization, check if a local wallet key exists. If not, spin up a fresh identity context.

```python
import os
from pathlib import Path
from pysui import SuiConfig, SyncClient
from pysui.abstracts import SignatureAlgo

def initialize_local_hot_wallet():
    """
    Generates an isolated Ed25519 hot wallet keypair locally on the server.
    Saves the private key file locally; returns the public address string.
    """
    key_dir = Path.home() / ".anima" / "keys"
    key_dir.mkdir(parents=True, exist_ok=True)
    key_file = key_dir / "operator.key"

    if not key_file.exists():
        print("⚡ No local operational key detected. Instantiating fresh runtime identity...")
        # Use pysui or standard Ed25519 cryptography to generate a keypair
        cfg = SuiConfig.default_architecture()
        # Export public address details
        with open(key_file, "w") as f:
            f.write(cfg.private_key_mnemonic_or_bytes)

    print("✓ Local cryptographic signature keys successfully isolated.")
    # Return public address hex string to pass to Joshua's Mint handler
    return os.getenv("OPERATOR_PUBLIC_ADDRESS")
```

### Step 2: Formulating the Strategy Blueprint (config/skill_schema.json)

Before minting, translate your model parameters into our standardized public skill config manifest JSON. This file dictates your agent's exact operational guardrails:

```json
{
  "skill_name": "DeepBook_HighFreq_Arbitrage",
  "version": "1.0.0",
  "target_pairs": ["SUI", "USDC"],
  "execution_constraints": {
    "max_spend_per_ptb_mist": 5000000000,
    "max_slippage_percentage": 0.5,
    "cooldown_period_seconds": 15
  },
  "model_telemetry": {
    "engine": "sklearn_crossover_v1",
    "observation_interval_ms": 3000
  }
}
```

### Step 3: Pinned Metadata Freezing (src/walrus.py)

Stream this JSON payload directly into the Walrus Testnet Publisher. This step returns the unique Walrus Blob ID string used by the smart contract as an un-fakeable audit reference.

```python
import requests

def publish_strategy_to_walrus(config_payload: dict) -> str:
    """
    Pushes public parameter thresholds to Walrus Testnet storage nodes.
    Returns the immutable, content-addressed Walrus Blob ID.
    """
    walrus_publisher_url = "https://publisher.walrus.testnet.sui.io/v1/store"

    response = requests.put(walrus_publisher_url, json=config_payload)
    if response.status_code == 200:
        blob_data = response.json()
        blob_id = blob_data["newElement"]["blobId"]
        print(f"✓ Strategy parameters frozen on Walrus. Blob ID: {blob_id}")
        return blob_id
    else:
        raise Exception("✖ Walrus network ingest pipeline failure.")
```

### Step 4: The On-Chain Synchronization Handshake

Once Step 1 and Step 3 are complete, provide your operator_address and your Walrus Blob ID to Joshua's input channel.

Joshua will execute the core Move initialization call using the human guardian's secure browser wallet. The transaction passes your operator_address into the smart contract and links your Walrus Blob ID directly via native Sui dynamic fields.

### Step 5: The Orchestrator Daemon Loop (src/orchestrator.py)

Your main Python execution engine must poll Joshua's live Supabase database instance or query the Sui Testnet fullnode RPC using your registered ANIMA Object ID.

Once your daemon catches the AnimaMinted confirmation, it triggers its persistent processing loops:

```python
import time
from pysui import SyncClient

def run_agent_orchestration_loop(anima_object_id: str):
    """
    Primary off-chain daemon loop. Synchronizes parameter maps,
    evaluates predictor signals, and submits signed PTBs via the hot wallet.
    """
    sui_client = SyncClient.extension_context()
    print(f"🤖 Agent runtime awakened for ANIMA Instance: {anima_object_id}")

    # 1. Fetch live identity object states from Sui network RPC
    # Extract the current operational mode (Normal vs PAUSED)

    while True:
        try:
            # 2. Sensor Phase: Poll live price arrays from DeepBook V3
            current_price = fetch_deepbook_pool_price()

            # 3. Brain Phase: Evaluate trade decisions using predictor inference models
            signal = evaluate_market_inference(current_price)

            if signal == "BUY_SIGNAL":
                print("🚨 Decision engine fired: Executing atomic strategy block...")

                # 4. Actuator Phase: Call the backend route to assemble the target PTB.
                # Sign and execute the transaction block using your local Hot Wallet Private Key.
                # The contract will verify that your signing address matches the operator_address.
                execute_atomic_trade_ptb(anima_object_id)

            time.sleep(3)  # Synchronized to standard fullnode validation intervals

        except Exception as err:
            print(f"✖ Loop exception caught: {err}")
            time.sleep(5)
```

---

## 4. Immediate High-Priority Action Items

Ezekiel, to remain strictly on track for our Day 1 and Day 2 Integration Benchmarks, complete these items immediately:

- **Verify Your Environment Dependencies:** Ensure your local workspace executes `pip install pysui requests python-dotenv` with zero binary link errors.

- **Expose the Address Generation Utilities:** Build the basic script execution tool so that when Joshua requests your machine address, you can generate it instantly.

Let's maintain extreme discipline and absolute execution speed. No shortcuts, no key leaks, pure modular performance. 
**The agent’s private key NEVER goes onto the internet, and it NEVER goes onto Walrus (even if encrypted).** Instead, your Python runtime container generates an autonomous `Ed25519` keypair locally on your host node server. The **private key** stays strictly isolated in your local server environment memory (`.env`). You will pass **only the public address string** back to Joshua's frontend workspace. This public address is hardcoded on-chain directly into the `ANIMA` identity object as the authorized `operator_address`.

This design pattern guarantees that even if your off-chain Python server is compromised, malicious actors are strictly bound by the spending limits and dynamic guardrails hardcoded into our Sui Move modules.

---

## 2. Your Repository Workspace Surface

All of your execution code must sit cleanly within the `/agent-runtime` workspace layout:




Your main Python execution engine must poll Joshua's live Supabase database instance or query the Sui Testnet fullnode RPC using your registered ANIMA Object ID.

Once your daemon catches the AnimaMinted confirmation, it triggers its persistent processing loops:

def run_agent_orchestration_loop(anima_object_id: str):
    # Primary off-chain daemon loop. Synchronizes parameter maps,
    # evaluates predictor signals, and submits signed PTBs via the hot wallet.
    print(f"🤖 Agent runtime awakened for ANIMA Instance: {anima_object_id}")

    while True:
        try:
            # Sensor Phase: Poll live price arrays from DeepBook V3
            current_price = 0.42

            # Brain Phase: Evaluate trade decisions using predictor inference models
            signal = "BUY_SIGNAL"

            if signal == "BUY_SIGNAL":
                print("🚨 Decision engine fired: Executing atomic strategy block...")
                # Actuator Phase: Assemble and sign the target transaction block
                # using your local Hot Wallet Private Key context.

            time.sleep(3)

        except Exception as err:
            print(f"✖ Loop exception caught: {err}")
            time.sleep(5)
4. Immediate High-Priority Action Items
Ezekiel, to remain strictly on track for our Day 1 and Day 2 Integration Benchmarks, complete these items immediately:

Verify Your Environment Dependencies: Ensure your local workspace executes pip install pysui requests python-dotenv with zero binary link errors.

Expose the Address Generation Utilities: Build the basic script execution tool so that when Joshua requests your machine address, you can generate it instantly.

Hardcode the Target Framework Mock States: For testing, hardcode your model's prediction output to consistently fire a mock BUY_SIGNAL every 45 seconds. This allows Joshua to verify that his custom Node.js event listener indexer can ingest, parse, and write actions to Supabase flawlessly before the real ML models are fully linked.

Let's maintain extreme discipline and absolute execution speed. No shortcuts, no key leaks, pure modular performance. Let me know the second your key storage routine passes local execution checks!
````
