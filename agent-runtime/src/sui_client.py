"""Sui RPC client for ANIMA agent runtime - fetches ANIMA object and skills."""

import asyncio
import logging
import json
import os
from typing import Optional, Dict, Any, List
import aiohttp
import requests

logger = logging.getLogger(__name__)


class SuiRPCClient:
    """
    Client for interacting with Sui blockchain.
    
    Responsibilities:
    - Fetch ANIMA object from testnet
    - Extract operator address and skill blob IDs
    - Query object state and dynamic fields
    """
    
    def __init__(self, rpc_url: Optional[str] = None):
        """
        Initialize Sui RPC client.
        
        Args:
            rpc_url: Sui testnet RPC endpoint
                    (default: https://testnet-rpc.sui.io)
        """
        self.rpc_url = rpc_url or os.getenv(
            "SUI_RPC_URL", 
            "https://testnet-rpc.sui.io"
        )
        self.session: Optional[aiohttp.ClientSession] = None
        
        logger.info(f"🔗 SuiRPCClient initialized")
        logger.info(f"   RPC Endpoint: {self.rpc_url}")
    
    async def initialize(self):
        """Initialize async HTTP session."""
        if self.session is None:
            self.session = aiohttp.ClientSession()
    
    async def close(self):
        """Close async HTTP session."""
        if self.session:
            await self.session.close()
    
    async def __aenter__(self):
        await self.initialize()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
    
    def _make_rpc_request(self, method: str, params: List = None) -> Dict[str, Any]:
        """
        Make synchronous JSON-RPC request to Sui.
        
        Args:
            method: RPC method name (e.g., "sui_getObject")
            params: Method parameters
        
        Returns:
            JSON response data
        """
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or []
        }
        
        try:
            response = requests.post(
                self.rpc_url,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "error" in data:
                    logger.error(f"RPC error: {data['error']}")
                    return None
                
                return data.get("result")
            else:
                logger.error(f"RPC request failed: {response.status_code}")
                return None
        
        except Exception as e:
            logger.error(f"Error making RPC request: {e}")
            return None
    
    def fetch_object(self, object_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch ANIMA object from Sui.
        
        Args:
            object_id: ANIMA object ID on Sui
        
        Returns:
            Object data or None if not found
        """
        try:
            logger.info(f"📥 Fetching ANIMA object: {object_id}")
            
            result = self._make_rpc_request("sui_getObject", [object_id])
            
            if result:
                logger.info(f"✓ ANIMA object fetched successfully")
                return result
            else:
                logger.error(f"✖ Failed to fetch ANIMA object")
                return None
        
        except Exception as e:
            logger.error(f"Error fetching object: {e}")
            return None
    
    def get_object_fields(self, object_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract fields from ANIMA object.
        
        Handles both regular fields and dynamic fields.
        
        Args:
            object_data: Object data from Sui RPC
        
        Returns:
            Dictionary of fields
        """
        try:
            fields = {}
            
            # Extract from object content
            if "data" in object_data:
                content = object_data["data"].get("content", {})
                
                # Regular fields
                if "fields" in content:
                    fields.update(content["fields"])
                
                # Dynamic fields (for skills, etc.)
                if "dynamicFields" in content:
                    for df in content["dynamicFields"]:
                        fields[df["name"]] = df
            
            return fields
        
        except Exception as e:
            logger.error(f"Error extracting fields: {e}")
            return {}
    
    def get_operator_address(self, object_data: Dict[str, Any]) -> Optional[str]:
        """
        Extract operator address from ANIMA object.
        
        Args:
            object_data: Object data from Sui RPC
        
        Returns:
            Operator address (0x-prefixed hex) or None
        """
        try:
            fields = self.get_object_fields(object_data)
            
            # Look for operator_address field
            if "operator_address" in fields:
                addr = fields["operator_address"]["fields"]["value"]
                logger.info(f"✓ Operator address: {addr}")
                return addr
            
            logger.warning("Operator address not found in object")
            return None
        
        except Exception as e:
            logger.error(f"Error extracting operator address: {e}")
            return None
    
    def get_skill_blob_ids(self, object_data: Dict[str, Any]) -> List[str]:
        """
        Extract skill blob IDs from ANIMA object.
        
        Args:
            object_data: Object data from Sui RPC
        
        Returns:
            List of Walrus blob IDs
        """
        try:
            fields = self.get_object_fields(object_data)
            blob_ids = []
            
            # Look for skill registry or dynamic fields
            for key, value in fields.items():
                if "blob" in key.lower() or "skill" in key.lower():
                    if isinstance(value, dict) and "id" in value:
                        blob_ids.append(value["id"])
                    elif isinstance(value, str):
                        blob_ids.append(value)
            
            if blob_ids:
                logger.info(f"✓ Found {len(blob_ids)} skill blob IDs")
            else:
                logger.warning("No skill blob IDs found in object")
            
            return blob_ids
        
        except Exception as e:
            logger.error(f"Error extracting blob IDs: {e}")
            return []
    
    def get_agent_status(self, object_data: Dict[str, Any]) -> Optional[str]:
        """
        Extract agent operational status (Normal/Paused/etc).
        
        Args:
            object_data: Object data from Sui RPC
        
        Returns:
            Status string or None
        """
        try:
            fields = self.get_object_fields(object_data)
            
            if "status" in fields:
                status = fields["status"]["fields"]["value"]
                logger.info(f"✓ Agent status: {status}")
                return status
            
            logger.warning("Status field not found")
            return "Unknown"
        
        except Exception as e:
            logger.error(f"Error extracting status: {e}")
            return None
    
    def get_agent_balance(self, object_data: Dict[str, Any]) -> Optional[int]:
        """
        Extract agent's SUI balance.
        
        Args:
            object_data: Object data from Sui RPC
        
        Returns:
            Balance in mist (smallest unit) or None
        """
        try:
            fields = self.get_object_fields(object_data)
            
            if "balance" in fields:
                balance = int(fields["balance"]["fields"]["value"])
                logger.info(f"✓ Agent balance: {balance} mist ({balance / 1e9:.2f} SUI)")
                return balance
            
            logger.warning("Balance field not found")
            return None
        
        except Exception as e:
            logger.error(f"Error extracting balance: {e}")
            return None


def main():
    """Test the Sui RPC client."""
    logging.basicConfig(level=logging.INFO)
    
    # Test with a mock ANIMA object ID
    # In real scenario, this comes from environment variable
    anima_object_id = os.getenv("ANIMA_OBJECT_ID", "0x0000000000000000000000000000000000000000")
    
    client = SuiRPCClient()
    
    # Fetch object
    obj = client.fetch_object(anima_object_id)
    
    if obj:
        print("\n✓ Successfully fetched ANIMA object")
        
        # Extract details
        operator = client.get_operator_address(obj)
        status = client.get_agent_status(obj)
        balance = client.get_agent_balance(obj)
        blob_ids = client.get_skill_blob_ids(obj)
        
        print(f"\nANIMA Object Details:")
        print(f"  ID: {anima_object_id}")
        print(f"  Operator: {operator}")
        print(f"  Status: {status}")
        print(f"  Balance: {balance}")
        print(f"  Skills: {len(blob_ids)} blob IDs")
        
        if blob_ids:
            for i, blob_id in enumerate(blob_ids, 1):
                print(f"    {i}. {blob_id}")
    else:
        print("\n✗ Failed to fetch ANIMA object")


if __name__ == "__main__":
    main()
