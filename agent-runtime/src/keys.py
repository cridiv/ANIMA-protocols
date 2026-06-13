"""Secure local keypair generation and management for ANIMA agent runtime."""

import os
import json
import logging
from pathlib import Path
from typing import Optional, Tuple
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.backends import default_backend

logger = logging.getLogger(__name__)


class KeyManager:
    """
    Manages secure local keypair generation and storage.
    
    Generates Ed25519 keypairs locally on the server and stores them securely.
    Private keys NEVER leave the local environment or go to Walrus.
    Only public address is shared with on-chain contracts.
    """
    
    def __init__(self, key_dir: Optional[Path] = None):
        """
        Initialize KeyManager with optional custom key directory.
        
        Args:
            key_dir: Path to store keys (defaults to ~/.anima/keys)
        """
        self.key_dir = key_dir or Path.home() / ".anima" / "keys"
        self.key_dir.mkdir(parents=True, exist_ok=True)
        self.key_file = self.key_dir / "operator.key"
        self.pub_file = self.key_dir / "operator.pub"
        self.addr_file = self.key_dir / "operator.addr"
    
    def generate_keypair(self) -> Tuple[str, str, str]:
        """
        Generate a new Ed25519 keypair locally.
        
        Returns:
            Tuple of (private_key_hex, public_key_hex, operator_address)
        """
        logger.info("⚡ Generating new Ed25519 keypair...")
        
        # Generate Ed25519 private key
        private_key = ed25519.Ed25519PrivateKey.generate()
        
        # Serialize to bytes
        private_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        # Get public key
        public_key = private_key.public_key()
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        
        # Convert to hex strings
        private_hex = private_bytes.hex()
        public_hex = public_bytes.hex()
        
        # Generate operator address (public key hex prefixed with 0x)
        operator_address = f"0x{public_hex}"
        
        logger.info(f"✓ Keypair generated successfully")
        logger.info(f"  Public Address: {operator_address}")
        
        return private_hex, public_hex, operator_address
    
    def initialize_local_hot_wallet(self) -> str:
        """
        Initialize or retrieve the local hot wallet keypair.
        
        On first run, generates a fresh keypair and stores locally.
        On subsequent runs, loads the existing keypair.
        
        Returns:
            Operator address (public key hex string)
        """
        if self.key_file.exists():
            logger.info("✓ Loading existing local operator key...")
            return self._load_operator_address()
        
        logger.info("⚡ No local operational key detected. Instantiating fresh runtime identity...")
        
        # Generate new keypair
        private_hex, public_hex, operator_address = self.generate_keypair()
        
        # Save private key (restricted permissions)
        self.key_file.write_text(private_hex)
        self.key_file.chmod(0o600)  # Read/write for owner only
        
        # Save public key
        self.pub_file.write_text(public_hex)
        
        # Save operator address
        self.addr_file.write_text(operator_address)
        
        logger.info(f"✓ Local cryptographic signature keys successfully isolated.")
        logger.info(f"  Private key: {self.key_file}")
        logger.info(f"  Public key: {self.pub_file}")
        logger.info(f"  Operator address: {self.addr_file}")
        
        return operator_address
    
    def _load_operator_address(self) -> str:
        """Load operator address from file."""
        if self.addr_file.exists():
            return self.addr_file.read_text().strip()
        
        # Fallback: regenerate from public key
        if self.pub_file.exists():
            public_hex = self.pub_file.read_text().strip()
            operator_address = f"0x{public_hex}"
            self.addr_file.write_text(operator_address)
            return operator_address
        
        raise FileNotFoundError(f"No operator address found at {self.addr_file}")
    
    def get_operator_address(self) -> str:
        """
        Get the current operator address.
        
        Returns:
            Operator address (0x-prefixed hex string)
        """
        if self.addr_file.exists():
            return self.addr_file.read_text().strip()
        
        raise FileNotFoundError(f"Operator address not found. Run initialize_local_hot_wallet() first.")
    
    def get_private_key(self) -> str:
        """
        Get the private key (for signing transactions).
        
        Returns:
            Private key hex string (WARNING: sensitive data)
        """
        if not self.key_file.exists():
            raise FileNotFoundError(f"Private key not found at {self.key_file}")
        
        return self.key_file.read_text().strip()
    
    def get_key_info(self) -> dict:
        """Get information about stored keys."""
        return {
            "operator_address": self.get_operator_address() if self.addr_file.exists() else None,
            "has_private_key": self.key_file.exists(),
            "has_public_key": self.pub_file.exists(),
            "key_dir": str(self.key_dir)
        }


def main():
    """Test the key manager."""
    logging.basicConfig(level=logging.INFO)
    
    km = KeyManager()
    
    # Initialize hot wallet
    addr = km.initialize_local_hot_wallet()
    print(f"\n✅ Operator Address: {addr}\n")
    
    # Show key info
    info = km.get_key_info()
    print(f"Key Info:")
    for k, v in info.items():
        if k != "key_dir":
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
