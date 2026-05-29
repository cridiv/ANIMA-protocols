"""Price monitoring module for ANIMA agent runtime."""

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
    
    TOKEN_ID_MAP = {
        "sui": "sui",
        "eth": "ethereum",
        "btc": "bitcoin",
        "usdc": "usd-coin",
        "usdt": "tether",
    }
    
    def __init__(self, poll_interval: int = 30):
        """Initialize price monitor."""
        self.poll_interval = poll_interval
        self.running = False
        self.price_history: Dict[str, List[PriceData]] = {}
        self.last_prices: Dict[str, float] = {}
        
    async def get_price(self, token: str) -> Optional[PriceData]:
        """Fetch current price for a token from CoinGecko."""
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
                    
                    if token not in self.price_history:
                        self.price_history[token] = []
                    self.price_history[token].append(price_data)
                    
                    if len(self.price_history[token]) > 100:
                        self.price_history[token] = self.price_history[token][-100:]
                    
                    self.last_prices[token] = float(price)
                    return price_data
                    
        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching price for {token}")
            return None
        except Exception as e:
            logger.error(f"Error fetching price for {token}: {e}")
            return None
    
    async def get_price_history(self, token: str, limit: int = 10) -> List[PriceData]:
        """Get recent price history for a token."""
        if token not in self.price_history:
            return []
        return self.price_history[token][-limit:]
    
    async def monitor_loop(self):
        """Main monitoring loop - runs continuously."""
        logger.info(f"🔄 Price monitor loop started (polling every {self.poll_interval}s)")
        self.running = True
        tokens_to_monitor = ["sui"]
        tick_count = 0
        
        while self.running:
            try:
                tick_count += 1
                logger.info(f"📊 Poll #{tick_count}")
                
                tasks = [self.get_price(token) for token in tokens_to_monitor]
                results = await asyncio.gather(*tasks)
                
                for token, price_data in zip(tokens_to_monitor, results):
                    if price_data:
                        logger.info(f"✅ {price_data}")
                    else:
                        logger.warning(f"❌ Failed to fetch {token}")
                
                await asyncio.sleep(self.poll_interval)
                
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                await asyncio.sleep(self.poll_interval)
    
    async def start(self):
        """Start the price monitor."""
        try:
            await self.monitor_loop()
        except Exception as e:
            logger.error(f"Monitor failed to start: {e}")
    
    def stop(self):
        """Stop the price monitor."""
        self.running = False
        logger.info("Price monitor stopped")
    
    def get_latest_price(self, token: str) -> Optional[float]:
        """Get the most recent price for a token."""
        return self.last_prices.get(token)
