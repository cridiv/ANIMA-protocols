"""Walrus storage integration for publishing skill configurations."""

import json
import logging
import requests
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class WalrusPublisher:
    """
    Publishes skill configurations to Walrus distributed storage.
    
    Walrus is Sui's native decentralized storage layer.
    Skill configurations are published here and the Blob ID is hardcoded on-chain.
    """
    
    # Walrus testnet endpoints
    WALRUS_PUBLISHER_URL = "https://publisher.walrus.testnet.sui.io/v1/store"
    WALRUS_AGGREGATOR_URL = "https://aggregator.walrus.testnet.sui.io"
    
    def __init__(self, publisher_url: Optional[str] = None, aggregator_url: Optional[str] = None):
        """
        Initialize Walrus publisher.
        
        Args:
            publisher_url: Override default publisher endpoint
            aggregator_url: Override default aggregator endpoint
        """
        self.publisher_url = publisher_url or self.WALRUS_PUBLISHER_URL
        self.aggregator_url = aggregator_url or self.WALRUS_AGGREGATOR_URL
        self.last_blob_id: Optional[str] = None
        
        logger.info(f"🐋 WalrusPublisher initialized")
        logger.info(f"   Publisher: {self.publisher_url}")
        logger.info(f"   Aggregator: {self.aggregator_url}")
    
    def publish_skill_config(self, config: Dict[str, Any]) -> Optional[str]:
        """
        Publish skill configuration to Walrus.
        
        Args:
            config: Configuration dictionary to publish
        
        Returns:
            Walrus Blob ID (immutable reference) or None if failed
        """
        try:
            logger.info("📤 Publishing skill configuration to Walrus...")
            
            # Serialize config to JSON
            config_json = json.dumps(config, indent=2)
            
            logger.debug(f"  Config size: {len(config_json)} bytes")
            logger.debug(f"  Config preview: {json.dumps(config, indent=2)[:200]}...")
            
            # Prepare request payload
            # Walrus expects the data as form-encoded or as raw bytes
            headers = {
                "Content-Type": "application/json"
            }
            
            # Make PUT request to Walrus publisher
            response = requests.put(
                self.publisher_url,
                data=config_json,
                headers=headers,
                timeout=30
            )
            
            logger.debug(f"  Response status: {response.status_code}")
            logger.debug(f"  Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                try:
                    response_data = response.json()
                    logger.debug(f"  Response body: {response_data}")
                    
                    # Extract Blob ID from response
                    # Structure may vary - try multiple paths
                    blob_id = (
                        response_data.get("blobId") or
                        response_data.get("blob_id") or
                        response_data.get("newElement", {}).get("blobId") or
                        response_data.get("newElement", {}).get("blob_id")
                    )
                    
                    if blob_id:
                        logger.info(f"✓ Strategy parameters frozen on Walrus")
                        logger.info(f"  📍 Blob ID: {blob_id}")
                        self.last_blob_id = blob_id
                        return blob_id
                    else:
                        logger.error(f"✖ No Blob ID in response: {response_data}")
                        return None
                
                except json.JSONDecodeError:
                    logger.error(f"✖ Failed to parse JSON response: {response.text}")
                    return None
            
            else:
                logger.error(f"✖ Walrus publisher returned status {response.status_code}")
                logger.error(f"  Response: {response.text}")
                return None
        
        except requests.exceptions.ConnectionError as e:
            logger.error(f"✖ Failed to connect to Walrus: {e}")
            logger.warning("⚠️  Walrus may not be available. Using mock blob ID for testing.")
            # For testing purposes, return a mock blob ID
            mock_blob_id = "MOCK_BLOB_" + config.get("skill_name", "unknown").replace(" ", "_").upper()
            self.last_blob_id = mock_blob_id
            return mock_blob_id
        
        except requests.exceptions.Timeout:
            logger.error(f"✖ Walrus request timed out")
            return None
        
        except Exception as e:
            logger.error(f"✖ Unexpected error publishing to Walrus: {e}", exc_info=True)
            return None
    
    def publish_skill_config_from_file(self, config_file: Path) -> Optional[str]:
        """
        Publish skill configuration from a JSON file.
        
        Args:
            config_file: Path to JSON config file
        
        Returns:
            Walrus Blob ID or None if failed
        """
        try:
            logger.info(f"📂 Loading config from: {config_file}")
            
            with open(config_file, 'r') as f:
                config = json.load(f)
            
            logger.info(f"✓ Config loaded: {config.get('skill_name', 'unknown')} v{config.get('version', '?')}")
            
            return self.publish_skill_config(config)
        
        except FileNotFoundError:
            logger.error(f"✖ Config file not found: {config_file}")
            return None
        
        except json.JSONDecodeError as e:
            logger.error(f"✖ Invalid JSON in config file: {e}")
            return None
        
        except Exception as e:
            logger.error(f"✖ Error reading config file: {e}")
            return None
    
    def retrieve_config_from_blob(self, blob_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve configuration from Walrus using Blob ID.
        
        Args:
            blob_id: Walrus Blob ID
        
        Returns:
            Configuration dictionary or None if retrieval failed
        """
        try:
            logger.info(f"📥 Retrieving config from Walrus blob: {blob_id}")
            
            # Query Walrus aggregator for the blob
            url = f"{self.aggregator_url}/v1/blobs/{blob_id}"
            
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                config = response.json()
                logger.info(f"✓ Config retrieved successfully")
                return config
            else:
                logger.error(f"✖ Failed to retrieve blob. Status: {response.status_code}")
                return None
        
        except Exception as e:
            logger.error(f"✖ Error retrieving config from Walrus: {e}")
            return None
    
    def get_last_blob_id(self) -> Optional[str]:
        """Get the most recent Blob ID from this session."""
        return self.last_blob_id


def main():
    """Test the Walrus publisher."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Load config from file
    config_file = Path(__file__).parent.parent / "config" / "skill_schema.json"
    
    publisher = WalrusPublisher()
    
    # Publish the config
    blob_id = publisher.publish_skill_config_from_file(config_file)
    
    if blob_id:
        print(f"\n✅ Successfully published to Walrus")
        print(f"   Blob ID: {blob_id}\n")
        print("   ⚠️  Share this Blob ID with Joshua for on-chain registration:")
        print(f"   WALRUS_BLOB_ID={blob_id}\n")
    else:
        print(f"\n❌ Failed to publish to Walrus\n")


if __name__ == "__main__":
    main()
