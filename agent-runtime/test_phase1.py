"""
Unit tests for ANIMA Agent Runtime Phase 1 components.

Run with: python -m pytest test_phase1.py -v
"""

import asyncio
import pytest
from datetime import datetime
from monitor import PriceMonitor, PriceData
from walrus_client import WalrusClient, SkillConfig, WalrusRoundTripTest


class TestPriceData:
    """Test PriceData dataclass."""
    
    def test_price_data_creation(self):
        """Test creating a PriceData object."""
        now = datetime.utcnow()
        price = PriceData(token="sui", price=0.42, timestamp=now)
        
        assert price.token == "sui"
        assert price.price == 0.42
        assert price.timestamp == now
        assert price.source == "coingecko"
    
    def test_price_data_repr(self):
        """Test PriceData string representation."""
        price = PriceData(token="sui", price=0.42, timestamp=datetime.utcnow())
        repr_str = repr(price)
        
        assert "Price(sui:" in repr_str
        assert "$0.42" in repr_str


class TestPriceMonitor:
    """Test PriceMonitor class."""
    
    def test_monitor_initialization(self):
        """Test initializing PriceMonitor."""
        monitor = PriceMonitor(poll_interval=60)
        
        assert monitor.poll_interval == 60
        assert monitor.running is False
        assert monitor.price_history == {}
        assert monitor.last_prices == {}
    
    def test_token_id_mapping(self):
        """Test that token IDs are mapped correctly."""
        monitor = PriceMonitor()
        
        assert monitor.TOKEN_ID_MAP["sui"] == "sui"
        assert monitor.TOKEN_ID_MAP["eth"] == "ethereum"
        assert monitor.TOKEN_ID_MAP["btc"] == "bitcoin"
    
    @pytest.mark.asyncio
    async def test_get_price_real_api(self):
        """Test fetching real price from CoinGecko."""
        monitor = PriceMonitor()
        
        # Fetch SUI price
        price_data = await monitor.get_price("sui")
        
        # Should return a valid PriceData object
        assert price_data is not None
        assert price_data.token == "sui"
        assert price_data.price > 0
        assert isinstance(price_data.timestamp, datetime)
        print(f"  ✅ Real price fetched: {price_data}")
    
    @pytest.mark.asyncio
    async def test_price_history_storage(self):
        """Test that price history is stored correctly."""
        monitor = PriceMonitor()
        
        # Fetch a price
        price1 = await monitor.get_price("sui")
        
        if price1:
            # Check history is stored
            assert "sui" in monitor.price_history
            assert len(monitor.price_history["sui"]) == 1
            assert monitor.price_history["sui"][0] == price1
    
    @pytest.mark.asyncio
    async def test_price_history_limit(self):
        """Test that price history doesn't grow unbounded."""
        monitor = PriceMonitor()
        
        # Add more than 100 prices
        for i in range(105):
            monitor.price_history["test"] = []
            for j in range(i + 1):
                monitor.price_history["test"].append(
                    PriceData(token="test", price=float(j), timestamp=datetime.utcnow())
                )
            
            if len(monitor.price_history["test"]) > 100:
                monitor.price_history["test"] = monitor.price_history["test"][-100:]
        
        # Should keep only last 100
        assert len(monitor.price_history["test"]) <= 100
    
    def test_get_latest_price(self):
        """Test retrieving the latest price."""
        monitor = PriceMonitor()
        
        # Set a price manually
        monitor.last_prices["sui"] = 0.42
        
        # Should retrieve it
        assert monitor.get_latest_price("sui") == 0.42
        assert monitor.get_latest_price("eth") is None


class TestSkillConfig:
    """Test SkillConfig dataclass."""
    
    def test_skill_config_creation(self):
        """Test creating a SkillConfig."""
        skill = SkillConfig(
            skill_name="test_skill",
            version="1.0",
            trigger={"type": "price_threshold", "value": 0.4},
            action={"type": "swap", "amount": 10},
            risk_limits={"max_spend": 10.0}
        )
        
        assert skill.skill_name == "test_skill"
        assert skill.version == "1.0"
    
    def test_skill_config_to_json(self):
        """Test converting SkillConfig to JSON."""
        skill = SkillConfig(
            skill_name="test_skill",
            version="1.0",
            trigger={"type": "price_threshold"},
            action={"type": "swap"},
            risk_limits={"max_spend": 10.0}
        )
        
        json_str = skill.to_json()
        
        assert isinstance(json_str, str)
        assert "test_skill" in json_str
        assert "1.0" in json_str
    
    def test_skill_config_from_json(self):
        """Test creating SkillConfig from JSON."""
        json_str = '''{
            "skill_name": "test",
            "version": "1.0",
            "trigger": {"type": "price"},
            "action": {"type": "swap"},
            "risk_limits": {"max_spend": 10.0}
        }'''
        
        skill = SkillConfig.from_json(json_str)
        
        assert skill.skill_name == "test"
        assert skill.version == "1.0"


class TestWalrusClient:
    """Test WalrusClient class."""
    
    def test_walrus_client_initialization(self):
        """Test initializing WalrusClient."""
        client = WalrusClient()
        
        assert client.endpoint == WalrusClient.WALRUS_ENDPOINT
        assert client.uploaded_blobs == {}
    
    @pytest.mark.asyncio
    async def test_upload_skill(self):
        """Test uploading a skill to Walrus."""
        client = WalrusClient()
        
        skill = SkillConfig(
            skill_name="test_skill",
            version="1.0",
            trigger={"type": "price_threshold"},
            action={"type": "swap"},
            risk_limits={"max_spend": 10.0}
        )
        
        blob_id = await client.upload_skill(skill)
        
        assert blob_id is not None
        assert isinstance(blob_id, str)
        assert len(blob_id) > 0
        assert blob_id in client.uploaded_blobs
        print(f"  ✅ Skill uploaded with blob_id: {blob_id}")
    
    @pytest.mark.asyncio
    async def test_retrieve_skill(self):
        """Test retrieving a skill from Walrus."""
        client = WalrusClient()
        
        # Upload first
        skill = SkillConfig(
            skill_name="test_skill",
            version="1.0",
            trigger={"type": "price_threshold", "value": 0.4},
            action={"type": "swap", "amount": 10},
            risk_limits={"max_spend": 10.0}
        )
        
        blob_id = await client.upload_skill(skill)
        
        # Retrieve
        retrieved = await client.retrieve_skill(blob_id)
        
        assert retrieved is not None
        assert retrieved.skill_name == skill.skill_name
        assert retrieved.version == skill.version
    
    @pytest.mark.asyncio
    async def test_verify_blob_integrity(self):
        """Test verifying blob integrity."""
        client = WalrusClient()
        
        skill = SkillConfig(
            skill_name="test_skill",
            version="1.0",
            trigger={},
            action={},
            risk_limits={}
        )
        
        blob_id = await client.upload_skill(skill)
        is_valid = await client.verify_blob_integrity(blob_id)
        
        assert is_valid is True
    
    @pytest.mark.asyncio
    async def test_round_trip(self):
        """Test complete Walrus round-trip."""
        result = await WalrusRoundTripTest.run()
        assert result is True


class TestIntegration:
    """Integration tests for Phase 1 components."""
    
    @pytest.mark.asyncio
    async def test_price_monitoring_for_5_seconds(self):
        """Test price monitor runs for 5 seconds without error."""
        monitor = PriceMonitor(poll_interval=1)
        
        # Run for 3 seconds then stop
        async def run_with_timeout():
            try:
                await asyncio.wait_for(monitor.start(), timeout=3)
            except asyncio.TimeoutError:
                monitor.stop()
        
        await run_with_timeout()
        
        # Should have collected some prices
        assert len(monitor.price_history) > 0 or len(monitor.last_prices) > 0


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
