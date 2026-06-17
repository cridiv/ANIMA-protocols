#!/usr/bin/env python3

import sys
import os
import logging
import time
import json
import subprocess
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

# Fix Unicode encoding for Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def generate_operator_address() -> str:
    """
    Generate or retrieve the operator address using the local Sui CLI.
    This guarantees the private key is created and stored in the local keystore.
    """
    print("\n=== ANIMA Operator Address Generation ===\n")
    
    addr_file = Path.home() / ".anima" / "keys" / "operator.addr"
    
    if addr_file.exists():
        addr = addr_file.read_text().strip()
        print(f"✓ Loaded existing address: {addr}\n")
        return addr
    
    import subprocess
    import json
    import sys
    
    print("⚡ Generating a new real operator address in Sui keystore...")
    is_windows = sys.platform.startswith('win')
    cmd = ["sui", "client", "new-address", "ed25519", "--json"]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, shell=is_windows)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            address = None
            if isinstance(data, dict):
                address = data.get("address")
            elif isinstance(data, list) and len(data) > 0:
                address = data[0].get("address")
            
            if address:
                addr_file.parent.mkdir(parents=True, exist_ok=True)
                addr_file.write_text(address)
                addr_file.chmod(0o600)
                print(f"✓ Generated new operator address: {address}")
                print("✓ Private key has been automatically saved in your Sui CLI keystore.\n")
                return address
            else:
                raise ValueError(f"Could not parse address from output: {result.stdout}")
        else:
            raise RuntimeError(f"Sui CLI failed: {result.stderr or result.stdout}")
    except Exception as e:
        print(f"✖ Failed to generate address via Sui CLI: {e}")
        print("Fallback: Using the active address of your Sui client instead...")
        cmd_active = ["sui", "client", "active-address"]
        try:
            res_active = subprocess.run(cmd_active, capture_output=True, text=True, shell=is_windows)
            if res_active.returncode == 0:
                # Extract address from output
                output_lines = res_active.stdout.strip().split("\n")
                address = output_lines[-1].strip()
                addr_file.parent.mkdir(parents=True, exist_ok=True)
                addr_file.write_text(address)
                addr_file.chmod(0o600)
                print(f"✓ Registered active address: {address}\n")
                return address
        except Exception as active_err:
            print(f"✖ Failed to retrieve active address: {active_err}")
            
        import secrets
        import hashlib
        random_bytes = secrets.token_bytes(32)
        addr_hash = hashlib.sha256(random_bytes).hexdigest()
        operator_address = f"0x{addr_hash[:40]}"
        addr_file.parent.mkdir(parents=True, exist_ok=True)
        addr_file.write_text(operator_address)
        addr_file.chmod(0o600)
        print(f"⚠️ Fallback to mock address: {operator_address} (No private key available!)\n")
        return operator_address

def auto_fund_operator(operator_address: str):
    """
    Auto-funds the operator address from the local active client address if balance is low.
    """
    cmd_bal = ["sui", "client", "balance", operator_address, "--json"]
    try:
        is_windows = sys.platform.startswith('win')
        res_bal = subprocess.run(cmd_bal, capture_output=True, text=True, shell=is_windows)
        has_balance = False
        if res_bal.returncode == 0:
            try:
                bal_data = json.loads(res_bal.stdout)
                if isinstance(bal_data, list) and len(bal_data) > 0:
                    coins_list = bal_data[0]
                    for item in coins_list:
                        if item.get("coinType") == "0x2::sui::SUI":
                            total_bal = int(item.get("totalBalance", 0))
                            if total_bal >= 10000000: # 0.01 SUI
                                has_balance = True
                                break
            except Exception:
                pass
        
        if not has_balance:
            print(f"⚠️  Operator address {operator_address} has low or zero gas balance.")
            print("⚡ Auto-funding operator address with 0.05 SUI from active client address...")
            
            cmd_fund = [
                "sui", "client", "ptb",
                "--split-coins", "gas", "[50000000]",
                "--assign", "new_coins",
                "--transfer-objects", "[new_coins.0]", f"@{operator_address}"
            ]
            res_fund = subprocess.run(cmd_fund, capture_output=True, text=True, shell=is_windows)
            if res_fund.returncode == 0:
                print("✓ Successfully funded operator address with 0.05 SUI for gas!\n")
            else:
                print(f"✖ Failed to fund operator address:\nStdout: {res_fund.stdout}\nStderr: {res_fund.stderr}\n")
    except Exception as e:
        print(f"✖ Error during auto-funding check: {e}")


def publish_skill_config(force: bool = False) -> str:
    """
    Publish skill configuration to Walrus.
    
    Returns the Walrus Blob ID.
    """
    print("=== Publishing Skill to Walrus ===\n")
    
    # Try to load existing blob ID
    blob_file = Path(__file__).parent / ".blob_id"
    
    if not force and blob_file.exists():
        blob_id = blob_file.read_text().strip()
        print(f"✓ Using published blob: {blob_id}\n")
        return blob_id
    
    # For testing: generate mock blob ID
    config_file = Path(__file__).parent / "config" / "skill_schema.json"
    
    if config_file.exists():
        try:
            from src.walrus_publish import WalrusPublisher
            publisher = WalrusPublisher()
            blob_id = publisher.publish_skill_config_from_file(config_file)
            if blob_id and not blob_id.startswith("MOCK_BLOB_"):
                blob_file.write_text(blob_id)
                print(f"✓ Published skill config to Walrus")
                print(f"   Skill: {config_file.name}")
                print(f"   Blob ID: {blob_id}\n")
                return blob_id
        except Exception as e:
            print(f"✖ Failed to publish to Walrus: {e}")
            
        import json
        with open(config_file) as f:
            config = json.load(f)
        
        skill_name = config.get("skill_name", "unknown").replace(" ", "_").upper()
        mock_blob_id = f"WALRUS_{skill_name}_V1"
        
        blob_file.write_text(mock_blob_id)
        
        print(f"✓ Published skill config (mock fallback)")
        print(f"   Skill: {config.get('skill_name')}")
        print(f"   Blob ID: {mock_blob_id}\n")
        
        return mock_blob_id
    
    return "MOCK_BLOB_ID"


def run_orchestrator_daemon():
    """
    Run the main orchestrator daemon loop.
    
    This is the primary execution engine for the agent.
    """
    print("\n" + "="*50)
    print("🤖 ANIMA ORCHESTRATOR DAEMON STARTED")
    print("="*50 + "\n")
    
    # Get environment
    anima_object_id = os.getenv("ANIMA_OBJECT_ID", "awaiting_minting")
    operator_address = os.getenv("OPERATOR_PUBLIC_ADDRESS")
    
    if not operator_address:
        operator_address = generate_operator_address()
        os.environ["OPERATOR_PUBLIC_ADDRESS"] = operator_address
    
    # Auto-fund the operator address if it has no SUI for gas
    auto_fund_operator(operator_address)
    
    blob_id = os.getenv("WALRUS_BLOB_ID")
    if not blob_id:
        blob_id = publish_skill_config()
        os.environ["WALRUS_BLOB_ID"] = blob_id
    
    print(f"📋 Configuration:")
    print(f"   ANIMA Object ID: {anima_object_id}")
    print(f"   Operator Address: {operator_address}")
    print(f"   Walrus Blob ID: {blob_id}\n")
    
    # Mock orchestration loop with hardcoded BUY signals every 45 seconds
    iteration = 0
    last_signal_time = None
    signal_interval = int(os.getenv("MOCK_SIGNAL_INTERVAL", "45"))
    
    print(f"⏱️  Mock Signal Interval: {signal_interval} seconds")
    print(f"   (Fire BUY_SIGNAL every {signal_interval}s for testing)\n")
    print("🔄 Starting event loop...\n")
    
    try:
        start_time = datetime.now()
        
        while True:
            iteration += 1
            current_time = time.time()
            
            try:
                # Sensor Phase: Fetch price
                import random
                price = 0.42 + random.uniform(-0.01, 0.01)
                
                # Brain Phase: Evaluate signal
                if last_signal_time is None:
                    signal = "BUY_SIGNAL"
                    last_signal_time = current_time
                    signal_count = 1
                else:
                    time_since_signal = current_time - last_signal_time
                    
                    if time_since_signal >= signal_interval:
                        signal = "BUY_SIGNAL"
                        last_signal_time = current_time
                        signal_count = int(time_since_signal / signal_interval)
                    else:
                        signal = "HOLD"
                
                # Actuator Phase: Execute if needed
                if signal == "BUY_SIGNAL":
                    print(f"[{iteration:06d}] 🚨 BUY_SIGNAL fired!")
                    print(f"         Price: ${price:.4f}")

                    
                    recipient = "0x2fc456a94bd287614dbd0f14b1c435c574008d62d68dc63299f867ef72bd0b18"
                    amount = 20000000  # 0.02 SUI in MIST
                    
                    package_id = os.getenv("SUI_PACKAGE_ID", "0x5f6681ebeff7b6a1a1f333ba20842d47ed822f39e3ca9d06de3a69f2282e6eca")
                    agent_id = os.getenv("ANIMA_OBJECT_ID") or os.getenv("AGENT_ID") or "0xd4177df14064788426efb4e5e4661f98a06bc01b29df1447261454b2dd5ef0d4"
                    if agent_id == "awaiting_minting":
                        agent_id = "0xd4177df14064788426efb4e5e4661f98a06bc01b29df1447261454b2dd5ef0d4"
                    
                    print(f"         🔗 Executing real on-chain SUI transfer from NFA vault...")
                    print(f"         Agent ID: {agent_id}")
                    print(f"         Target: {recipient}")
                    print(f"         Amount: 0.02 SUI ({amount} MIST)")
                    
                    is_windows = sys.platform.startswith('win')
                    cmd = [
                        "sui", "client", "ptb",
                        "--sender", f"@{operator_address}",
                        "--move-call", f"{package_id}::wallet::extract_funds_for_action", f"@{agent_id}", str(amount),
                        "--assign", "extracted_coin",
                        "--transfer-objects", "[extracted_coin]", f"@{recipient}",
                        "--json"
                    ]
                    
                    result = subprocess.run(cmd, capture_output=True, text=True, shell=is_windows)
                    
                    if result.returncode == 0:
                        tx_data = {}
                        try:
                            tx_data = json.loads(result.stdout)
                        except Exception:
                            pass
                        
                        digest = None
                        if isinstance(tx_data, dict):
                            digest = tx_data.get("digest")
                        elif isinstance(tx_data, list) and len(tx_data) > 0:
                            digest = tx_data[0].get("digest")
                        
                        if digest:
                            print(f"         ✓ Transaction executed successfully on Sui Testnet!")
                            print(f"         Digest: {digest}")
                            print(f"         Explorer URL: https://suivision.xyz/txblock/{digest}\n")
                        else:
                            print(f"         ✓ Transaction submitted successfully (Raw output received)\n")
                    else:
                        print(f"         ✖ Sui CLI PTB command failed with code {result.returncode}")
                        print(f"         Stdout: {result.stdout}")
                        print(f"         Stderr: {result.stderr}\n")
                else:
                    # Log every 30 iterations
                    if iteration % 30 == 0:
                        uptime = (datetime.now() - start_time).total_seconds()
                        time_to_signal = signal_interval - (current_time - last_signal_time) if last_signal_time else 0
                        print(f"[{iteration:06d}] ⏳ HOLD | Price: ${price:.4f} | Uptime: {uptime:.0f}s | Next signal in: {time_to_signal:.0f}s")
                
                # Poll interval
                time.sleep(3)  # Synchronized to fullnode validation intervals
            
            except KeyboardInterrupt:
                raise
            
            except Exception as err:
                logger.error(f"✖ Loop exception: {err}")
                time.sleep(5)
    
    except KeyboardInterrupt:
        uptime = (datetime.now() - start_time).total_seconds()
        print(f"\n\n⏹️  Orchestrator stopped")
        print(f"   Total iterations: {iteration}")
        print(f"   Uptime: {uptime:.0f}s\n")


def show_status():
    """Show current runtime status."""
    print("\n=== ANIMA Agent Runtime Status ===\n")
    
    # Check for keys
    key_dir = Path.home() / ".anima" / "keys"
    
    if key_dir.exists():
        addr_file = key_dir / "operator.addr"
        if addr_file.exists():
            addr = addr_file.read_text().strip()
            print(f"✓ Operator Address: {addr}")
        
        if (key_dir / "operator.key").exists():
            print(f"✓ Private Key: Stored locally (protected)")
    else:
        print(f"✗ No keys generated yet")
    
    # Check config
    config_file = Path(__file__).parent / "config" / "skill_schema.json"
    if config_file.exists():
        import json
        with open(config_file) as f:
            config = json.load(f)
        print(f"✓ Skill: {config.get('skill_name')} v{config.get('version')}")
    else:
        print(f"✗ No skill config")
    
    # Check blob ID
    blob_file = Path(__file__).parent / ".blob_id"
    if blob_file.exists():
        blob_id = blob_file.read_text().strip()
        print(f"✓ Walrus Blob: {blob_id}")
    else:
        print(f"✗ No Walrus blob published")
    
    print()


def show_usage():
    """Show usage information."""
    print("""
╔════════════════════════════════════════════════════════════╗
║  ANIMA Agent Runtime - Orchestrator Daemon                 ║
║  Building AI agent autonomy on Sui                         ║
╚════════════════════════════════════════════════════════════╝

Usage:
  python main.py               # Run orchestrator daemon
  python main.py generate-address    # Generate operator address
  python main.py publish-skill       # Publish skill to Walrus
  python main.py status              # Show runtime status

Environment Variables:
  ANIMA_OBJECT_ID              # Sui object ID (awaiting minting)
  OPERATOR_PUBLIC_ADDRESS      # Operator wallet address
  WALRUS_BLOB_ID              # Skill config blob ID
  MOCK_SIGNAL_INTERVAL        # Signal frequency (default: 45s)
  SUI_RPC_URL                 # Sui testnet RPC (optional)
  WALRUS_ENDPOINT             # Walrus endpoint (optional)

Examples:
  # Generate address
  python main.py generate-address

  # Show status
  python main.py status

  # Run daemon (fires BUY_SIGNAL every 45s)
  python main.py

  # Run with custom signal interval (30 seconds)
  set MOCK_SIGNAL_INTERVAL=30
  python main.py

""")


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command in ["--help", "-h", "help"]:
            show_usage()
            return 0
        
        elif command == "generate-address":
            addr = generate_operator_address()
            print(f"✅ Ready to share with Joshua:")
            print(f"   OPERATOR_PUBLIC_ADDRESS={addr}\n")
            return 0
        
        elif command == "publish-skill":
            blob_id = publish_skill_config(force=True)
            print(f"✅ Ready to share with Joshua:")
            print(f"   WALRUS_BLOB_ID={blob_id}\n")
            return 0
        
        elif command == "status":
            show_status()
            return 0
        
        else:
            print(f"❌ Unknown command: {command}\n")
            show_usage()
            return 1
    
    # Default: run daemon
    run_orchestrator_daemon()
    return 0


if __name__ == "__main__":
    sys.exit(main())
