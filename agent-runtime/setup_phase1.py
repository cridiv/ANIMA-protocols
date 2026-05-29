#!/usr/bin/env python
"""
ANIMA Agent Runtime - Phase 1 Setup Script

This script initializes the project structure, creates all necessary files,
and validates the setup. Run this once to bootstrap Phase 1.
"""

import os
import sys
from pathlib import Path


def create_project_structure():
    """Create the complete project directory structure."""
    base_path = Path(__file__).parent
    
    # Define directories
    directories = [
        "src",
        "models",
        "config",
        "tests",
    ]
    
    print("📁 Creating project directories...")
    for dir_name in directories:
        dir_path = base_path / dir_name
        dir_path.mkdir(exist_ok=True)
        print(f"  ✅ {dir_name}/")
    
    # Create __init__.py files for Python packages
    init_files = ["src", "tests"]
    for package in init_files:
        init_path = base_path / package / "__init__.py"
        if not init_path.exists():
            init_path.write_text('"""ANIMA Agent Runtime Package."""\n')
            print(f"  ✅ {package}/__init__.py")
    
    print("✨ Project structure created successfully!\n")


def create_src_files(base_path):
    """Create source code files."""
    print("📝 Creating source files...")
    src_path = Path(base_path) / "src"
    
    # monitor.py
    monitor_code = '''"""Price monitoring module for ANIMA agent runtime."""

import asyncio
import logging
import aiohttp
from datetime import datetime
from typing import Dict, Optional, List
from dataclasses import dataclass


logger = logging.getLogger(__name__)


@dataclass
class PriceData:
    """Container for price information."""
    token: str
    price: float
    timestamp: datetime
    source: str = "coingecko"
    
    def __repr__(self):
        return f"Price({self.token}: ${self.price} @ {self.timestamp.isoformat()})"


class PriceMonitor:
    """
    Monitors token prices using CoinGecko free API.
    Polls every 30 seconds by default.
    """
    
    COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
    
    # Map common token names to CoinGecko IDs
    TOKEN_ID_MAP = {
        "sui": "sui",
        "eth": "ethereum",
        "btc": "bitcoin",
        "usdc": "usd-coin",
        "usdt": "tether",
    }
    
    def __init__(self, poll_interval: int = 30):
        """
        Initialize price monitor.
        
        Args:
            poll_interval: Seconds between price polls (default 30)
        """
        self.poll_interval = poll_interval
        self.running = False
        self.price_history: Dict[str, List[PriceData]] = {}
        self.last_prices: Dict[str, float] = {}
        
    async def get_price(self, token: str) -> Optional[PriceData]:
        """
        Fetch current price for a token from CoinGecko.
        
        Args:
            token: Token symbol (e.g., 'sui', 'eth')
            
        Returns:
            PriceData object or None if fetch fails
        """
        token_lower = token.lower()
        token_id = self.TOKEN_ID_MAP.get(token_lower, token_lower)
        
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.COINGECKO_BASE_URL}/simple/price"
                params = {
                    "ids": token_id,
                    "vs_currencies": "usd",
                    "include_24hr_change": "true"
                }
                
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status != 200:
                        logger.warning(f"CoinGecko returned status {response.status} for {token}")
                        return None
                    
                    data = await response.json()
                    
                    if token_id not in data:
                        logger.warning(f"Token {token} not found in CoinGecko response")
                        return None
                    
                    price = data[token_id].get("usd")
                    if price is None:
                        logger.warning(f"No USD price for {token}")
                        return None
                    
                    price_data = PriceData(
                        token=token,
                        price=float(price),
                        timestamp=datetime.utcnow()
                    )
                    
                    # Store in history
                    if token not in self.price_history:
                        self.price_history[token] = []
                    self.price_history[token].append(price_data)
                    
                    # Keep only last 100 prices per token
                    if len(self.price_history[token]) > 100:
                        self.price_history[token] = self.price_history[token][-100:]
                    
                    # Update last price
                    self.last_prices[token] = float(price)
                    
                    return price_data
                    
        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching price for {token}")
            return None
        except Exception as e:
            logger.error(f"Error fetching price for {token}: {e}", exc_info=True)
            return None
    
    async def get_price_history(self, token: str, limit: int = 10) -> List[PriceData]:
        """
        Get recent price history for a token.
        
        Args:
            token: Token symbol
            limit: Number of recent prices to return
            
        Returns:
            List of PriceData objects
        """
        if token not in self.price_history:
            return []
        return self.price_history[token][-limit:]
    
    async def monitor_loop(self):
        """
        Main monitoring loop - runs continuously.
        Polls prices at the specified interval.
        """
        logger.info(f"🔄 Price monitor loop started (polling every {self.poll_interval}s)")
        self.running = True
        tokens_to_monitor = ["sui"]  # Add more tokens as needed
        tick_count = 0
        
        while self.running:
            try:
                tick_count += 1
                logger.info(f"📊 Poll #{tick_count}")
                
                # Fetch prices for all monitored tokens
                tasks = [self.get_price(token) for token in tokens_to_monitor]
                results = await asyncio.gather(*tasks)
                
                # Log results
                for token, price_data in zip(tokens_to_monitor, results):
                    if price_data:
                        logger.info(f"✅ {price_data}")
                    else:
                        logger.warning(f"❌ Failed to fetch {token}")
                
                # Wait for next poll
                await asyncio.sleep(self.poll_interval)
                
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}", exc_info=True)
                await asyncio.sleep(self.poll_interval)
    
    async def start(self):
        """Start the price monitor."""
        try:
            await self.monitor_loop()
        except Exception as e:
            logger.error(f"Monitor failed to start: {e}", exc_info=True)
    
    def stop(self):
        """Stop the price monitor."""
        self.running = False
        logger.info("Price monitor stopped")
    
    def get_latest_price(self, token: str) -> Optional[float]:
        """Get the most recent price for a token."""
        return self.last_prices.get(token)
'''
    
    monitor_file = src_path / "monitor.py"
    monitor_file.write_text(monitor_code)
    print(f"  ✅ src/monitor.py")


def setup_phase_1():
    """Main setup function."""
    base_path = Path(__file__).parent
    
    print("=" * 60)
    print("ANIMA AGENT RUNTIME - PHASE 1 SETUP")
    print("=" * 60 + "\n")
    
    # Create structure
    create_project_structure()
    
    # Create source files
    create_src_files(base_path)
    
    print("\n✨ PHASE 1 SETUP COMPLETE!\n")
    print("📋 Next steps:")
    print("  1. pip install -r requirements.txt")
    print("  2. python -m pytest tests/ -v")
    print("  3. python main.py")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    setup_phase_1()
