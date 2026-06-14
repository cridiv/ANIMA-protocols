"""ML-based price predictor module for ANIMA agent runtime."""

import logging
import numpy as np
import os
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

logger = logging.getLogger(__name__)


@dataclass
class Signal:
    """Trading signal output."""
    action: str  # BUY, HOLD, SELL
    confidence: float  # 0-100
    price: float
    timestamp: datetime
    reasoning: str
    
    def __repr__(self):
        return f"[ANIMA] Price: ${self.price:.4f} | Signal: {self.action} | Confidence: {self.confidence:.0f}%"


class PricePredictor:
    """
    ML-based price predictor combining multiple strategies:
    1. Moving Average Crossover (fast vs slow)
    2. Momentum-based sklearn classifier
    3. Ensemble decision with confidence scoring
    """
    
    def __init__(self, fast_window: int = 5, slow_window: int = 20):
        """
        Initialize predictor with MA windows.
        
        Args:
            fast_window: Short-term moving average window
            slow_window: Long-term moving average window
        """
        self.fast_window = fast_window
        self.slow_window = slow_window
        self.model = None
        self.scaler = StandardScaler()
        self.model_trained = False
        self.last_signal: Optional[Signal] = None
        
    def _extract_features(self, prices: List[float]) -> Optional[np.ndarray]:
        """
        Extract features from price history.
        
        Features:
        - Price momentum (rate of change)
        - Volatility (std dev of returns)
        - Relative strength (price vs MA)
        - Volume proxy (price change magnitude)
        """
        if len(prices) < self.slow_window:
            return None
        
        prices_arr = np.array(prices)
        
        # Calculate returns
        returns = np.diff(prices_arr) / prices_arr[:-1]
        
        # Feature 1: Momentum (last 5 bars change)
        momentum = (prices_arr[-1] - prices_arr[-6]) / prices_arr[-6] if len(prices_arr) > 5 else 0
        
        # Feature 2: Volatility
        volatility = np.std(returns[-20:]) if len(returns) >= 20 else np.std(returns)
        
        # Feature 3: Fast MA
        fast_ma = np.mean(prices_arr[-self.fast_window:])
        
        # Feature 4: Slow MA
        slow_ma = np.mean(prices_arr[-self.slow_window:])
        
        # Feature 5: MA crossover signal
        ma_ratio = fast_ma / (slow_ma + 1e-8)
        
        # Feature 6: Price relative to fast MA
        price_to_ma_ratio = prices_arr[-1] / (fast_ma + 1e-8)
        
        # Feature 7: Average return (trend direction)
        avg_return = np.mean(returns[-10:]) if len(returns) >= 10 else np.mean(returns)
        
        features = np.array([
            momentum,
            volatility,
            ma_ratio,
            price_to_ma_ratio,
            avg_return,
            returns[-1] if len(returns) > 0 else 0
        ])
        
        return features
    
    def _generate_labels(self, prices: List[float], lookahead: int = 5) -> Optional[np.ndarray]:
        """
        Generate labels for training (0=SELL, 1=HOLD, 2=BUY).
        Based on future price movement.
        """
        if len(prices) < self.slow_window + lookahead:
            return None
        
        prices_arr = np.array(prices)
        labels = []
        
        for i in range(len(prices_arr) - lookahead):
            current_price = prices_arr[i + self.slow_window - 1]
            future_price = prices_arr[i + self.slow_window - 1 + lookahead]
            price_change = (future_price - current_price) / current_price
            
            # Label based on future performance
            if price_change > 0.02:  # 2% gain threshold
                labels.append(2)  # BUY
            elif price_change < -0.02:  # 2% loss threshold
                labels.append(0)  # SELL
            else:
                labels.append(1)  # HOLD
        
        return np.array(labels) if labels else None
    
    def train(self, prices: List[float]) -> bool:
        """
        Train the ML model on historical price data.
        
        Args:
            prices: List of historical prices
            
        Returns:
            True if training successful, False otherwise
        """
        if len(prices) < self.slow_window + 10:
            logger.warning(f"Insufficient data for training. Need {self.slow_window + 10}, got {len(prices)}")
            return False
        
        try:
            # Generate features for all available data points
            features_list = []
            labels_list = []
            
            for i in range(len(prices) - self.slow_window - 5):
                window_prices = prices[i:i + self.slow_window + 5]
                features = self._extract_features(window_prices)
                
                if features is not None:
                    features_list.append(features)
            
            if not features_list:
                logger.warning("Could not extract any features for training")
                return False
            
            features_arr = np.array(features_list)
            
            # Generate labels based on next 5 bars
            labels_arr = self._generate_labels(prices, lookahead=5)
            
            if labels_arr is None or len(labels_arr) != len(features_arr):
                logger.warning("Could not generate consistent labels")
                return False
            
            # Normalize features
            features_scaled = self.scaler.fit_transform(features_arr)
            
            # Train model (using RandomForest for better generalization)
            self.model = RandomForestClassifier(n_estimators=10, max_depth=5, random_state=42)
            self.model.fit(features_scaled, labels_arr)
            
            self.model_trained = True
            logger.info(f"✅ Predictor model trained on {len(prices)} price points")
            return True
            
        except Exception as e:
            logger.error(f"Error training predictor: {e}")
            return False
    
    def _moving_average_signal(self, prices: List[float]) -> Tuple[str, float]:
        """
        Simple moving average crossover strategy.
        Returns (signal, confidence)
        """
        if len(prices) < self.slow_window:
            return "HOLD", 0.0
        
        prices_arr = np.array(prices)
        fast_ma = np.mean(prices_arr[-self.fast_window:])
        slow_ma = np.mean(prices_arr[-self.slow_window:])
        
        current_price = prices_arr[-1]
        price_distance = abs(current_price - fast_ma) / (fast_ma + 1e-8)
        
        # Base confidence on MA distance
        base_confidence = min(50.0, price_distance * 200)
        
        if fast_ma > slow_ma:
            # Uptrend
            signal = "BUY"
            confidence = 50.0 + base_confidence * 0.5
        elif fast_ma < slow_ma:
            # Downtrend
            signal = "SELL"
            confidence = 50.0 + base_confidence * 0.5
        else:
            signal = "HOLD"
            confidence = 30.0
        
        return signal, min(95.0, confidence)
    
    def predict(self, prices: List[float]) -> Signal:
        """
        Generate trading signal based on price history.
        
        Args:
            prices: List of recent prices (at least slow_window points)
            
        Returns:
            Signal object with action, confidence, and reasoning
        """
        if len(prices) < self.slow_window:
            logger.warning(f"Insufficient price history. Need {self.slow_window}, got {len(prices)}")
            signal = Signal(
                action="HOLD",
                confidence=0.0,
                price=prices[-1] if prices else 0.0,
                timestamp=datetime.utcnow(),
                reasoning="Insufficient data for prediction"
            )
            return signal
        
        current_price = prices[-1]
        reasoning_parts = []
        
        try:
            # Strategy 1: Moving Average Crossover
            ma_signal, ma_confidence = self._moving_average_signal(prices)
            reasoning_parts.append(f"MA: {ma_signal}({ma_confidence:.0f}%)")
            
            # Strategy 2: ML Model (if trained)
            ml_signal = None
            ml_confidence = 0.0
            
            if self.model_trained:
                features = self._extract_features(prices)
                if features is not None:
                    try:
                        features_scaled = self.scaler.transform(features.reshape(1, -1))
                        
                        # Get prediction probabilities
                        probabilities = self.model.predict_proba(features_scaled)[0]
                        predicted_label = np.argmax(probabilities)
                        max_probability = probabilities[predicted_label]
                        
                        # Convert label to signal
                        label_to_signal = {0: "SELL", 1: "HOLD", 2: "BUY"}
                        ml_signal = label_to_signal[predicted_label]
                        ml_confidence = max_probability * 100
                        
                        reasoning_parts.append(f"ML: {ml_signal}({ml_confidence:.0f}%)")
                    except Exception as e:
                        logger.debug(f"ML prediction error: {e}")
            
            # Ensemble decision
            signals = [ma_signal]
            confidences = [ma_confidence]
            
            if ml_signal:
                signals.append(ml_signal)
                confidences.append(ml_confidence)
            
            # Voting-based ensemble
            signal_counts = {}
            weighted_confidence = 0.0
            total_weight = 0.0
            
            for sig, conf in zip(signals, confidences):
                signal_counts[sig] = signal_counts.get(sig, 0) + 1
                weighted_confidence += conf
                total_weight += 1.0
            
            # Get most voted signal
            final_signal = max(signal_counts, key=signal_counts.get)
            final_confidence = min(99.0, weighted_confidence / total_weight)
            
            reasoning = " | ".join(reasoning_parts)
            
            signal = Signal(
                action=final_signal,
                confidence=final_confidence,
                price=current_price,
                timestamp=datetime.utcnow(),
                reasoning=reasoning
            )
            
            self.last_signal = signal
            return signal
            
        except Exception as e:
            logger.error(f"Error generating prediction: {e}")
            signal = Signal(
                action="HOLD",
                confidence=0.0,
                price=current_price,
                timestamp=datetime.utcnow(),
                reasoning=f"Error: {str(e)}"
            )
            return signal
    
    def get_last_signal(self) -> Optional[Signal]:
        """Get the most recent signal."""
        return self.last_signal


class MockPredictor:
    """
    Mock predictor for testing.
    
    Fires BUY_SIGNAL at a configured interval (default 45 seconds).
    Useful for testing the orchestrator and backend without ML models.
    """
    
    def __init__(self, signal_interval: int = 45):
        """
        Initialize mock predictor.
        
        Args:
            signal_interval: Seconds between BUY_SIGNAL firings
        """
        self.signal_interval = signal_interval
        self.last_signal_time: Optional[float] = None
        self.signal_count = 0
        self.last_signal: Optional[Signal] = None
    
    def predict(self, prices: List[float]) -> Signal:
        """
        Generate mock trading signal.
        
        Returns BUY_SIGNAL every signal_interval seconds, HOLD otherwise.
        """
        current_time = time.time()
        
        if self.last_signal_time is None:
            # First signal
            self.last_signal_time = current_time
            self.signal_count += 1
            signal = Signal(
                action="BUY_SIGNAL",
                confidence=95.0,
                price=prices[-1] if prices else 0.0,
                timestamp=datetime.utcnow(),
                reasoning=f"Mock signal #{self.signal_count} (interval={self.signal_interval}s)"
            )
            self.last_signal = signal
            logger.info(f"🚨 Mock predictor fired BUY_SIGNAL")
            return signal
        
        time_since_last = current_time - self.last_signal_time
        
        if time_since_last >= self.signal_interval:
            # Time for next signal
            self.last_signal_time = current_time
            self.signal_count += 1
            signal = Signal(
                action="BUY_SIGNAL",
                confidence=95.0,
                price=prices[-1] if prices else 0.0,
                timestamp=datetime.utcnow(),
                reasoning=f"Mock signal #{self.signal_count} (fired every {self.signal_interval}s)"
            )
            self.last_signal = signal
            logger.info(f"🚨 Mock predictor fired BUY_SIGNAL #{self.signal_count}")
            return signal
        
        else:
            # Hold signal
            signal = Signal(
                action="HOLD",
                confidence=50.0,
                price=prices[-1] if prices else 0.0,
                timestamp=datetime.utcnow(),
                reasoning=f"Waiting for next signal ({self.signal_interval - time_since_last:.0f}s remaining)"
            )
            return signal
    
    def get_last_signal(self) -> Optional[Signal]:
        """Get the most recent signal."""
        return self.last_signal
