"""Price monitoring module for ANIMA agent runtime."""

import logging
import requests
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
    Supports both sync price fetching.
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
    
    def get_price_sync(self, token: str) -> Optional[float]:
        """
        Synchronously fetch current price for a token.
        
        Args:
            token: Token symbol (sui, eth, btc, usdc, usdt)
        
        Returns:
            Price in USD or None if unavailable
        """
        token_lower = token.lower()
        token_id = self.TOKEN_ID_MAP.get(token_lower, token_lower)
        
        try:
            url = f"{self.COINGECKO_BASE_URL}/simple/price"
            params = {
                "ids": token_id,
                "vs_currencies": "usd",
                "include_24hr_change": "true"
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code != 200:
                logger.warning(f"CoinGecko returned status {response.status_code} for {token}")
                return self.last_prices.get(token)
            
            data = response.json()
            
            if token_id not in data:
                logger.warning(f"Token {token} not found in CoinGecko response")
                return self.last_prices.get(token)
            
            price = data[token_id].get("usd")
            if price is None:
                logger.warning(f"No USD price for {token}")
                return self.last_prices.get(token)
            
            self.last_prices[token] = price
            
            if token not in self.price_history:
                self.price_history[token] = []
            
            self.price_history[token].append(
                PriceData(token=token, price=price, timestamp=datetime.utcnow())
            )
            
            if len(self.price_history[token]) > 1000:
                self.price_history[token].pop(0)
            
            return price
        
        except requests.exceptions.Timeout:
            logger.warning(f"CoinGecko request timeout for {token}")
            return self.last_prices.get(token)
        
        except Exception as e:
            logger.error(f"Error fetching price for {token}: {e}")
            return self.last_prices.get(token)
    
    def get_price_history(self, token: str, limit: int = 10) -> List[PriceData]:
        """Get recent price history for a token."""
        if token not in self.price_history:
            return []
        return self.price_history[token][-limit:]
    
    def get_latest_price(self, token: str) -> Optional[float]:
        """Get the most recent price for a token."""
        return self.last_prices.get(token)
    
    def stop(self):
        """Stop the price monitor."""
        self.running = False
        logger.info("Price monitor stopped")
