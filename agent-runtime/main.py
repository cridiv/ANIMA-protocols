"""
ANIMA Agent Runtime - Main Entry Point

This module bootstraps the agent runtime and coordinates all components.
"""

import asyncio
import logging
import os
from dotenv import load_dotenv
from monitor import PriceMonitor
from walrus_client import WalrusClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main runtime entry point."""
    logger.info("="*60)
    logger.info("🚀 ANIMA AGENT RUNTIME - PHASE 1")
    logger.info("="*60)
    
    # Initialize components
    price_monitor = PriceMonitor(poll_interval=30)
    
    try:
        # Start price monitoring
        logger.info("\n📊 Starting price monitoring loop...")
        logger.info("Press Ctrl+C to stop\n")
        await price_monitor.start()
        
    except KeyboardInterrupt:
        logger.info("\n\n✋ Shutdown signal received")
        price_monitor.stop()
    except Exception as e:
        logger.error(f"❌ Runtime error: {e}", exc_info=True)
    finally:
        logger.info("✅ Runtime shutdown complete")


if __name__ == "__main__":
    asyncio.run(main())
