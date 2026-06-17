#!/usr/bin/env python3

from src.orchestrator import AnimaOrchestrator, OrchestratorConfig
from src.walrus_publish import WalrusPublisher
from src.keys import KeyManager
import sys
import os
import argparse
import logging
import json
from pathlib import Path
from typing import Optional

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


class AnimaCLI:
    """Command-line interface for ANIMA agent runtime."""

    def __init__(self):
        self.key_manager = KeyManager()
        self.walrus_publisher = WalrusPublisher()

    def cmd_generate_address(self, args) -> int:
        """Generate or retrieve operator address."""
        logger.info("=== ANIMA Address Generation ===\n")

        try:
            # Initialize/retrieve local hot wallet
            operator_address = self.key_manager.initialize_local_hot_wallet()

            print(f"\n✅ Operator Address Generated/Retrieved:")
            print(f"   {operator_address}\n")

            # Show key info
            info = self.key_manager.get_key_info()
            print(f"Key Storage Location:")
            print(f"   {info['key_dir']}\n")

            # Show format for environment variable
            print(f"Add this to your .env file:")
            print(f"   OPERATOR_PUBLIC_ADDRESS={operator_address}\n")

            return 0

        except Exception as e:
            logger.error(f"Error generating address: {e}")
            return 1

    def cmd_publish_skill(self, args) -> int:
        """Publish skill configuration to Walrus."""
        logger.info("=== ANIMA Skill Publishing ===\n")

        try:
            config_file = Path(args.config_file or "config/skill_schema.json")

            if not config_file.is_absolute():
                config_file = Path(__file__).parent / config_file

            logger.info(f"Publishing skill from: {config_file}\n")

            blob_id = self.walrus_publisher.publish_skill_config_from_file(
                config_file)

            if blob_id:
                print(f"\n✅ Skill Published Successfully!")
                print(f"   Walrus Blob ID: {blob_id}\n")

                print(f"Share with Joshua:")
                print(f"   WALRUS_BLOB_ID={blob_id}\n")

                # Save blob ID to file for reference
                blob_file = Path(__file__).parent / ".blob_id"
                blob_file.write_text(blob_id)
                logger.info(f"✓ Blob ID saved to: {blob_file}")

                return 0
            else:
                logger.error("Failed to publish skill to Walrus")
                return 1

        except Exception as e:
            logger.error(f"Error publishing skill: {e}")
            return 1

    def cmd_show_config(self, args) -> int:
        """Show the current skill configuration."""
        try:
            config_file = Path(args.config_file or "config/skill_schema.json")

            if not config_file.is_absolute():
                config_file = Path(__file__).parent / config_file

            with open(config_file, 'r') as f:
                config = json.load(f)

            print("\n=== Skill Configuration ===\n")
            print(json.dumps(config, indent=2))
            print()

            return 0

        except Exception as e:
            logger.error(f"Error reading config: {e}")
            return 1

    def cmd_run_daemon(self, args) -> int:
        """Run the orchestrator daemon loop."""
        logger.info("=== ANIMA Orchestrator Daemon ===\n")

        try:
            config = OrchestratorConfig()

            # Require ANIMA object ID
            if not config.anima_object_id:
                print("\n❌ ANIMA_OBJECT_ID not set!")
                print("   Set environment variable: ANIMA_OBJECT_ID=<your-object-id>\n")
                return 1

            # Get operator address if not set
            if not config.operator_address:
                config.operator_address = self.key_manager.get_operator_address()

            # Run orchestrator
            orchestrator = AnimaOrchestrator(config)
            orchestrator.run_orchestration_loop()

            return 0

        except KeyboardInterrupt:
            print("\n\n⏹️  Daemon stopped by user")
            return 0

        except Exception as e:
            logger.error(f"Error running daemon: {e}", exc_info=True)
            return 1

    def cmd_status(self, args) -> int:
        """Show agent runtime status."""
        print("\n=== ANIMA Agent Runtime Status ===\n")

        try:
            # Check keys
            key_info = self.key_manager.get_key_info()

            print("🔐 Key Management:")
            if key_info['has_private_key']:
                print(f"   ✓ Private key: {key_info['key_dir']}/operator.key")
            else:
                print(f"   ✗ Private key: NOT FOUND")

            if key_info['has_public_key']:
                print(f"   ✓ Public key: {key_info['key_dir']}/operator.pub")
            else:
                print(f"   ✗ Public key: NOT FOUND")

            if key_info['operator_address']:
                print(f"   ✓ Address: {key_info['operator_address']}")
            else:
                print(f"   ✗ Address: NOT FOUND")

            # Check env vars
            print("\n🌍 Environment Variables:")
            required_vars = [
                'ANIMA_OBJECT_ID',
                'OPERATOR_PUBLIC_ADDRESS',
                'SUI_RPC_URL',
                'WALRUS_ENDPOINT'
            ]

            for var in required_vars:
                value = os.getenv(var)
                if value:
                    if len(value) > 50:
                        display = value[:47] + "..."
                    else:
                        display = value
                    print(f"   ✓ {var}: {display}")
                else:
                    print(f"   ✗ {var}: NOT SET")

            # Check config file
            print("\n⚙️  Configuration:")
            config_file = Path(__file__).parent / "config/skill_schema.json"

            if config_file.exists():
                with open(config_file) as f:
                    config = json.load(f)
                print(f"   ✓ Skill: {config.get('skill_name')}")
                print(f"   ✓ Version: {config.get('version')}")
                print(
                    f"   ✓ Constraints: max_spend={config.get('execution_constraints', {}).get('max_spend_per_ptb_mist')} mist")
            else:
                print(f"   ✗ Skill config not found: {config_file}")

            # Check Blob ID
            print("\n📦 Walrus Storage:")
            blob_file = Path(__file__).parent / ".blob_id"
            if blob_file.exists():
                blob_id = blob_file.read_text().strip()
                print(f"   ✓ Last published blob: {blob_id}")
            else:
                print(f"   ✗ No published blob (run: anima publish-skill)")

            print()
            return 0

        except Exception as e:
            logger.error(f"Error getting status: {e}")
            return 1


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="ANIMA Agent Runtime CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  anima generate-address
  anima publish-skill
  anima run-daemon
  anima status
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # generate-address command
    subparsers.add_parser(
        'generate-address',
        help='Generate or retrieve operator address'
    )

    # publish-skill command
    publish_parser = subparsers.add_parser(
        'publish-skill',
        help='Publish skill configuration to Walrus'
    )
    publish_parser.add_argument(
        '--config-file',
        help='Path to skill configuration JSON file',
        default='config/skill_schema.json'
    )

    # show-config command
    config_parser = subparsers.add_parser(
        'show-config',
        help='Show skill configuration'
    )
    config_parser.add_argument(
        '--config-file',
        help='Path to skill configuration JSON file',
        default='config/skill_schema.json'
    )

    # run-daemon command
    subparsers.add_parser(
        'run-daemon',
        help='Run orchestrator daemon loop'
    )

    # status command
    subparsers.add_parser(
        'status',
        help='Show agent runtime status'
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    cli = AnimaCLI()

    if args.command == 'generate-address':
        return cli.cmd_generate_address(args)
    elif args.command == 'publish-skill':
        return cli.cmd_publish_skill(args)
    elif args.command == 'show-config':
        return cli.cmd_show_config(args)
    elif args.command == 'run-daemon':
        return cli.cmd_run_daemon(args)
    elif args.command == 'status':
        return cli.cmd_status(args)
    else:
        parser.print_help()
        return 1


if __name__ == '__main__':
    sys.exit(main())
