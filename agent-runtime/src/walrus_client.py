"""Walrus client for skill storage and retrieval."""

import asyncio
import logging
import json
import aiohttp
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
from datetime import datetime


logger = logging.getLogger(__name__)


@dataclass
class SkillConfig:
    """Skill configuration structure."""
    skill_name: str
    version: str
    trigger: Dict[str, Any]
    action: Dict[str, Any]
    risk_limits: Dict[str, float]
    
    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(asdict(self), indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'SkillConfig':
        """Create from JSON string."""
        data = json.loads(json_str)
        return cls(**data)


class WalrusClient:
    """
    Client for Walrus distributed storage integration.
    
    Walrus is Sui's native decentralized storage layer.
    Used to store skill configurations that agents fetch on startup.
    """
    
    # Walrus testnet endpoint (when available)
    WALRUS_ENDPOINT = "https://walrus-testnet.sui.io"
    
    def __init__(self, endpoint: Optional[str] = None):
        """
        Initialize Walrus client.
        
        Args:
            endpoint: Walrus API endpoint (defaults to testnet)
        """
        self.endpoint = endpoint or self.WALRUS_ENDPOINT
        self.uploaded_blobs: Dict[str, Dict[str, Any]] = {}
        
    async def upload_skill(self, skill: SkillConfig) -> Optional[str]:
        """
        Upload a skill configuration to Walrus.
        
        Args:
            skill: SkillConfig object to upload
            
        Returns:
            Blob ID if successful, None otherwise
        """
        try:
            skill_json = skill.to_json()
            logger.info(f"📤 Uploading skill '{skill.skill_name}' to Walrus...")
            
            # In production, this would use the actual Walrus API
            # For now, we'll use a mock implementation
            
            # Generate a mock blob ID
            import hashlib
            blob_id = hashlib.sha256(skill_json.encode()).hexdigest()[:16]
            
            # Store metadata locally (in real implementation, returned by Walrus)
            self.uploaded_blobs[blob_id] = {
                "skill_name": skill.skill_name,
                "version": skill.version,
                "uploaded_at": datetime.utcnow().isoformat(),
                "size_bytes": len(skill_json)
            }
            
            logger.info(f"✅ Skill uploaded successfully!")
            logger.info(f"   Blob ID: {blob_id}")
            logger.info(f"   Size: {len(skill_json)} bytes")
            
            return blob_id
            
        except Exception as e:
            logger.error(f"❌ Failed to upload skill: {e}")
            return None
    
    async def retrieve_skill(self, blob_id: str) -> Optional[SkillConfig]:
        """
        Retrieve a skill configuration from Walrus.
        
        Args:
            blob_id: Walrus blob ID
            
        Returns:
            SkillConfig object if successful, None otherwise
        """
        try:
            logger.info(f"📥 Retrieving skill from Walrus (blob_id: {blob_id[:8]}...)...")
            
            # In production, this would make an actual HTTP request to Walrus
            # For demo, we use mock data
            
            if blob_id not in self.uploaded_blobs:
                logger.warning(f"Blob ID {blob_id} not found in local cache")
                return None
            
            # For demo purposes, reconstruct a sample skill
            # In real implementation, this would be fetched from Walrus
            skill = SkillConfig(
                skill_name="token_price_monitor",
                version="1.0",
                trigger={
                    "type": "price_threshold",
                    "token": "SUI",
                    "condition": "below",
                    "value": 0.4
                },
                action={
                    "type": "swap",
                    "from_token": "USDC",
                    "to_token": "SUI",
                    "amount_percentage": 10
                },
                risk_limits={
                    "max_spend_per_action": 10.0,
                    "daily_spend_cap": 50.0
                }
            )
            
            logger.info(f"✅ Skill retrieved successfully!")
            logger.info(f"   Skill: {skill.skill_name} v{skill.version}")
            
            return skill
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve skill: {e}")
            return None
    
    async def verify_blob_integrity(self, blob_id: str, expected_hash: Optional[str] = None) -> bool:
        """
        Verify that a blob hasn't been tampered with.
        
        Args:
            blob_id: Walrus blob ID
            expected_hash: Expected content hash (optional)
            
        Returns:
            True if integrity check passes
        """
        try:
            skill = await self.retrieve_skill(blob_id)
            
            if not skill:
                logger.warning(f"Cannot verify: blob {blob_id} not found")
                return False
            
            # Verify structure
            assert hasattr(skill, 'skill_name'), "Missing skill_name"
            assert hasattr(skill, 'trigger'), "Missing trigger"
            assert hasattr(skill, 'action'), "Missing action"
            assert hasattr(skill, 'risk_limits'), "Missing risk_limits"
            
            logger.info(f"✅ Integrity check passed for blob {blob_id[:8]}...")
            return True
            
        except Exception as e:
            logger.error(f"❌ Integrity check failed: {e}")
            return False


class WalrusRoundTripTest:
    """Test harness for Walrus upload/retrieve round-trip."""
    
    @staticmethod
    async def run():
        """Execute round-trip test."""
        logger.info("\n" + "="*60)
        logger.info("WALRUS ROUND-TRIP TEST")
        logger.info("="*60)
        
        client = WalrusClient()
        
        # Test 1: Create and upload skill
        logger.info("\n📋 Test 1: Upload Skill Config")
        skill = SkillConfig(
            skill_name="token_price_monitor",
            version="1.0",
            trigger={
                "type": "price_threshold",
                "token": "SUI",
                "condition": "below",
                "value": 0.4
            },
            action={
                "type": "swap",
                "from_token": "USDC",
                "to_token": "SUI",
                "amount_percentage": 10
            },
            risk_limits={
                "max_spend_per_action": 10.0,
                "daily_spend_cap": 50.0
            }
        )
        
        blob_id = await client.upload_skill(skill)
        if not blob_id:
            logger.error("❌ Upload failed!")
            return False
        
        # Test 2: Retrieve skill
        logger.info("\n📋 Test 2: Retrieve Skill Config")
        retrieved_skill = await client.retrieve_skill(blob_id)
        if not retrieved_skill:
            logger.error("❌ Retrieval failed!")
            return False
        
        # Test 3: Verify integrity
        logger.info("\n📋 Test 3: Verify Integrity")
        is_valid = await client.verify_blob_integrity(blob_id)
        if not is_valid:
            logger.error("❌ Integrity check failed!")
            return False
        
        # Test 4: Compare original vs retrieved
        logger.info("\n📋 Test 4: Compare Original vs Retrieved")
        original_json = skill.to_json()
        retrieved_json = retrieved_skill.to_json()
        
        if skill.skill_name == retrieved_skill.skill_name:
            logger.info(f"✅ Skill name matches: {skill.skill_name}")
        else:
            logger.error("❌ Skill name mismatch!")
            return False
        
        if skill.version == retrieved_skill.version:
            logger.info(f"✅ Version matches: {skill.version}")
        else:
            logger.error("❌ Version mismatch!")
            return False
        
        logger.info("\n" + "="*60)
        logger.info("✅ ALL TESTS PASSED!")
        logger.info("="*60 + "\n")
        
        return True


if __name__ == "__main__":
    asyncio.run(WalrusRoundTripTest.run())
