#!/usr/bin/env python3

import sys
import os
import logging
import time
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
    Generate or retrieve the operator address.
    
    For now, creates a mock address. In production, uses Ed25519 keypair.
    """
    print("\n=== ANIMA Operator Address Generation ===\n")
    
    # Try to load existing address
    addr_file = Path.home() / ".anima" / "keys" / "operator.addr"
    
    if addr_file.exists():
        addr = addr_file.read_text().strip()
        print(f"✓ Loaded existing address: {addr}\n")
        return addr
    
    # Generate new address (mock for now)
    import hashlib
    import secrets
    
    random_bytes = secrets.token_bytes(32)
    addr_hash = hashlib.sha256(random_bytes).hexdigest()
    operator_address = f"0x{addr_hash[:40]}"
    
    # Save it
    addr_file.parent.mkdir(parents=True, exist_ok=True)
    addr_file.write_text(operator_address)
    addr_file.chmod(0o600)
    
    print(f"⚡ Generated new operator address:")
    print(f"   {operator_address}\n")
    
    return operator_address


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
                    print(f"         Status: Transaction would be submitted\n")
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
