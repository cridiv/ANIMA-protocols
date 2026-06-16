"""Walrus storage integration for publishing skill configurations."""

import json
import logging
import os
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
    WALRUS_PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space/v1/blobs"
    WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space"
    
    def __init__(self, publisher_url: Optional[str] = None, aggregator_url: Optional[str] = None):
        """
        Initialize Walrus publisher.
        
        Args:
            publisher_url: Override default publisher endpoint
            aggregator_url: Override default aggregator endpoint
        """
        # Check environment overrides
        env_publisher = os.getenv("WALRUS_PUBLISHER_URL")
        env_aggregator = os.getenv("WALRUS_AGGREGATOR_URL")
        
        # Also check WALRUS_ENDPOINT to construct them if they aren't explicitly set
        env_endpoint = os.getenv("WALRUS_ENDPOINT")
        if env_endpoint:
            if not env_publisher:
                # If endpoint doesn't end with /v1/blobs, add it
                if not env_endpoint.endswith("/v1/blobs"):
                    env_publisher = f"{env_endpoint.rstrip('/')}/v1/blobs"
                else:
                    env_publisher = env_endpoint
            if not env_aggregator:
                # Aggregator is the base endpoint
                if env_endpoint.endswith("/v1/blobs"):
                    env_aggregator = env_endpoint[:-9].rstrip('/')
                else:
                    env_aggregator = env_endpoint.rstrip('/')
            
        self.publisher_url = publisher_url or env_publisher or self.WALRUS_PUBLISHER_URL
        self.aggregator_url = aggregator_url or env_aggregator or self.WALRUS_AGGREGATOR_URL
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
            headers = {
                "Content-Type": "application/json"
            }
            
            url = self.publisher_url
            if "?" not in url:
                url = f"{url}?epochs=5"
            
            logger.info(f"📤 Sending PUT to: {url}")
            response = requests.put(
                url,
                data=config_json,
                headers=headers,
                timeout=30
            )
            
            # Fallback to public testnet publisher if user's endpoint 404s/405s
            if (response.status_code == 404 or response.status_code == 405) and self.publisher_url != self.WALRUS_PUBLISHER_URL:
                logger.warning(f"⚠️  Primary publisher returned {response.status_code}. Falling back to public Walrus testnet publisher...")
                fallback_url = f"{self.WALRUS_PUBLISHER_URL}?epochs=5"
                logger.info(f"📤 Sending PUT to fallback: {fallback_url}")
                response = requests.put(
                    fallback_url,
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
                    blob_id = (
                        response_data.get("blobId") or
                        response_data.get("blob_id") or
                        response_data.get("newlyCreated", {}).get("blobObject", {}).get("blobId") or
                        response_data.get("alreadyCertified", {}).get("blobObject", {}).get("blobId") or
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
        try:
            logger.info(f"📥 Retrieving from Walrus: {blob_id}")
            url = f"{self.aggregator_url}/v1/blobs/{blob_id}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                config = response.json()
                logger.info(f"✓ Loaded dynamic skill config from Walrus")
                return config
            
            logger.warning(f"Walrus returned {response.status_code} for {blob_id}")
            # Optional: fallback query to backend for latest config
            return self._fallback_to_backend(blob_id)
        
        except Exception as e:
            logger.error(f"Walrus retrieval failed: {e}")
            return self._fallback_to_backend(blob_id)  # or raise

    def _fallback_to_backend(self, blob_id: str = None) -> Optional[Dict[str, Any]]:
        # Call backend for resolved skill config (new endpoint you can add)
        try:
            resp = requests.get(f"{self.backend_url.rstrip('/')}/skills/latest", timeout=10)  # or /skills/{blob_id}
            if resp.status_code == 200:
                return resp.json()
        
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
