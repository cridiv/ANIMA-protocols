"""Model training and persistence for ANIMA agent runtime."""

import os
import logging
import pickle
import json
from pathlib import Path
from typing import Optional, List
import numpy as np
from datetime import datetime

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Manages ML model training, saving, and loading.
    
    Supports:
    - Training models on historical price data
    - Saving models to disk with metadata
    - Loading models on startup
    - Version management
    """
    
    def __init__(self, model_dir: Optional[Path] = None):
        """
        Initialize model manager.
        
        Args:
            model_dir: Directory to store models (default: ./models)
        """
        self.model_dir = model_dir or Path(__file__).parent.parent / "models"
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.current_model: Optional[RandomForestClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self.model_metadata: Optional[dict] = None
        
        logger.info(f"📁 ModelManager initialized: {self.model_dir}")
    
    def train_model(
        self,
        prices: List[float],
        fast_window: int = 5,
        slow_window: int = 20
    ) -> bool:
        """
        Train ML model on historical price data.
        
        Uses moving average crossover + momentum features.
        
        Args:
            prices: Historical price data
            fast_window: Short-term MA window
            slow_window: Long-term MA window
        
        Returns:
            True if training successful
        """
        try:
            if len(prices) < slow_window + 10:
                logger.warning(f"Insufficient data for training: need {slow_window + 10}, got {len(prices)}")
                return False
            
            logger.info(f"🧠 Training model on {len(prices)} price points...")
            
            prices_arr = np.array(prices, dtype=np.float32)
            
            # Feature extraction
            features_list = []
            labels_list = []
            
            for i in range(len(prices_arr) - slow_window - 5):
                window = prices_arr[i:i + slow_window + 5]
                
                # Moving averages
                fast_ma = np.mean(window[-fast_window:])
                slow_ma = np.mean(window[-slow_window:])
                ma_ratio = fast_ma / (slow_ma + 1e-8)
                
                # Momentum
                momentum = (window[-1] - window[-6]) / window[-6] if len(window) > 5 else 0
                
                # Volatility
                returns = np.diff(window) / window[:-1]
                volatility = np.std(returns[-10:]) if len(returns) >= 10 else 0
                
                features = np.array([ma_ratio, momentum, volatility])
                features_list.append(features)
                
                # Label based on future performance
                current_price = window[-1]
                future_price = prices_arr[i + slow_window - 1 + 5] if i + slow_window + 4 < len(prices_arr) else current_price
                
                price_change = (future_price - current_price) / current_price
                
                if price_change > 0.02:
                    labels_list.append(2)  # BUY
                elif price_change < -0.02:
                    labels_list.append(0)  # SELL
                else:
                    labels_list.append(1)  # HOLD
            
            if not features_list:
                logger.error("Could not extract features")
                return False
            
            X = np.array(features_list, dtype=np.float32)
            y = np.array(labels_list)
            
            # Normalize features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.current_model = RandomForestClassifier(
                n_estimators=50,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            self.current_model.fit(X_scaled, y)
            
            # Metadata
            self.model_metadata = {
                "version": "1.0",
                "trained_at": datetime.utcnow().isoformat(),
                "data_points": len(prices),
                "training_samples": len(X),
                "feature_count": X.shape[1],
                "fast_window": fast_window,
                "slow_window": slow_window
            }
            
            logger.info(f"✅ Model trained successfully")
            logger.info(f"   Training samples: {len(X)}")
            logger.info(f"   Classes: BUY (2), HOLD (1), SELL (0)")
            
            return True
        
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False
    
    def save_model(self, version: str = "v1.0") -> Optional[Path]:
        """
        Save trained model to disk.
        
        Args:
            version: Model version identifier
        
        Returns:
            Path to saved model or None
        """
        if self.current_model is None:
            logger.error("No model to save")
            return None
        
        try:
            logger.info(f"💾 Saving model version: {version}")
            
            model_file = self.model_dir / f"predictor_{version}.pkl"
            scaler_file = self.model_dir / f"scaler_{version}.pkl"
            metadata_file = self.model_dir / f"metadata_{version}.json"
            
            # Save model
            with open(model_file, 'wb') as f:
                pickle.dump(self.current_model, f)
            
            # Save scaler
            if self.scaler:
                with open(scaler_file, 'wb') as f:
                    pickle.dump(self.scaler, f)
            
            # Save metadata
            if self.model_metadata:
                with open(metadata_file, 'w') as f:
                    json.dump(self.model_metadata, f, indent=2)
            
            logger.info(f"✓ Model saved to: {model_file}")
            
            return model_file
        
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            return None
    
    def load_model(self, version: str = "v1.0") -> bool:
        """
        Load model from disk.
        
        Args:
            version: Model version to load
        
        Returns:
            True if loaded successfully
        """
        try:
            model_file = self.model_dir / f"predictor_{version}.pkl"
            scaler_file = self.model_dir / f"scaler_{version}.pkl"
            metadata_file = self.model_dir / f"metadata_{version}.json"
            
            if not model_file.exists():
                logger.warning(f"Model not found: {model_file}")
                return False
            
            logger.info(f"📂 Loading model version: {version}")
            
            # Load model
            with open(model_file, 'rb') as f:
                self.current_model = pickle.load(f)
            
            # Load scaler if exists
            if scaler_file.exists():
                with open(scaler_file, 'rb') as f:
                    self.scaler = pickle.load(f)
            
            # Load metadata if exists
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    self.model_metadata = json.load(f)
            
            logger.info(f"✓ Model loaded successfully")
            if self.model_metadata:
                logger.info(f"  Trained at: {self.model_metadata.get('trained_at')}")
                logger.info(f"  Data points: {self.model_metadata.get('data_points')}")
            
            return True
        
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def list_available_models(self) -> list:
        """
        List all available model versions.
        
        Returns:
            List of version strings
        """
        try:
            versions = set()
            
            for file in self.model_dir.glob("predictor_*.pkl"):
                # Extract version from filename: predictor_v1.0.pkl
                parts = file.stem.split('_', 1)
                if len(parts) > 1:
                    versions.add(parts[1])
            
            return sorted(list(versions))
        
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []
    
    def get_latest_model(self) -> Optional[str]:
        """
        Get the latest model version.
        
        Returns:
            Latest version string or None
        """
        versions = self.list_available_models()
        return versions[-1] if versions else None
    
    def predict(self, features: np.ndarray) -> Optional[int]:
        """
        Make prediction with current model.
        
        Args:
            features: Feature vector
        
        Returns:
            Predicted class (0=SELL, 1=HOLD, 2=BUY) or None
        """
        if self.current_model is None:
            return None
        
        try:
            if self.scaler:
                features = self.scaler.transform([features])
            else:
                features = [features]
            
            return self.current_model.predict(features)[0]
        
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return None


def main():
    """Test the model manager."""
    logging.basicConfig(level=logging.INFO)
    
    manager = ModelManager()
    
    # Generate synthetic price data
    np.random.seed(42)
    prices = 0.40 + np.cumsum(np.random.normal(0, 0.005, 200)).astype(float)
    prices = prices.tolist()
    
    print("\n=== Model Manager Test ===\n")
    
    # Train model
    if manager.train_model(prices):
        # Save model
        manager.save_model("v1.0")
        
        # List models
        print(f"\nAvailable models: {manager.list_available_models()}")
        print(f"Latest model: {manager.get_latest_model()}")
    else:
        print("Failed to train model")


if __name__ == "__main__":
    main()
