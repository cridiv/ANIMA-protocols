#!/usr/bin/env python3
"""Quick test of the predictor module to verify functionality."""

import sys
import os

# Add the agent-runtime directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.predictor import PricePredictor, Signal
from datetime import datetime
import random

def test_predictor_basic():
    """Test basic predictor functionality."""
    print("="*70)
    print("ANIMA PREDICTOR - UNIT TEST")
    print("="*70)
    
    # Initialize predictor
    predictor = PricePredictor(fast_window=5, slow_window=20)
    print("\n✅ Predictor initialized")
    print(f"   - Fast window: {predictor.fast_window}")
    print(f"   - Slow window: {predictor.slow_window}")
    
    # Generate test prices
    print("\n📊 Generating synthetic price history...")
    random.seed(42)
    prices = []
    price = 1.0
    
    for i in range(100):
        trend = 0.001 * (i % 20 - 10)
        noise = random.gauss(0, 0.005)
        price = price * (1 + trend + noise)
        prices.append(max(price, 0.5))
    
    print(f"✅ Generated {len(prices)} price points")
    print(f"   - Price range: ${min(prices):.4f} - ${max(prices):.4f}")
    
    # Train model
    print("\n📚 Training ML model...")
    if predictor.train(prices):
        print("✅ Model trained successfully")
        print(f"   - Model type: RandomForestClassifier")
        print(f"   - Training samples: {len(prices) - predictor.slow_window}")
    else:
        print("❌ Model training failed")
        return False
    
    # Test 1: Prediction on current prices
    print("\n🎯 TEST 1: Generate signal with current prices")
    signal = predictor.predict(prices)
    print(signal)
    print(f"   Reasoning: {signal.reasoning}")
    assert signal.action in ["BUY", "HOLD", "SELL"], "Invalid signal action"
    assert 0 <= signal.confidence <= 100, "Invalid confidence"
    assert signal.price > 0, "Invalid price"
    print("✅ PASSED")
    
    # Test 2: Uptrend scenario
    print("\n🎯 TEST 2: Strong uptrend (price +15%)")
    uptrend = prices[:30] + [prices[-1] * (1 + 0.01*i) for i in range(1, 16)]
    signal = predictor.predict(uptrend)
    print(signal)
    print(f"   Reasoning: {signal.reasoning}")
    assert signal.action in ["BUY", "HOLD", "SELL"], "Invalid signal"
    print("✅ PASSED")
    
    # Test 3: Downtrend scenario
    print("\n🎯 TEST 3: Strong downtrend (price -15%)")
    downtrend = prices[:30] + [prices[-1] * (1 - 0.01*i) for i in range(1, 16)]
    signal = predictor.predict(downtrend)
    print(signal)
    print(f"   Reasoning: {signal.reasoning}")
    assert signal.action in ["BUY", "HOLD", "SELL"], "Invalid signal"
    print("✅ PASSED")
    
    # Test 4: Insufficient data
    print("\n🎯 TEST 4: Insufficient price data")
    short_prices = [1.0, 1.01, 1.02, 1.03]
    signal = predictor.predict(short_prices)
    print(signal)
    assert signal.confidence == 0.0, "Should have zero confidence"
    print("✅ PASSED")
    
    # Test 5: Signal format
    print("\n🎯 TEST 5: Signal format validation")
    signal = predictor.predict(prices)
    formatted = str(signal)
    print(f"   Format: {formatted}")
    assert "[ANIMA]" in formatted, "Missing ANIMA tag"
    assert "Price:" in formatted, "Missing Price"
    assert "Signal:" in formatted, "Missing Signal"
    assert "Confidence:" in formatted, "Missing Confidence"
    assert "%" in formatted, "Missing percentage symbol"
    print("✅ PASSED - Format is correct!")
    
    print("\n" + "="*70)
    print("✅ ALL TESTS PASSED!")
    print("="*70)
    print("\nPredictor is ready for deployment!")
    print("\nUsage:")
    print("  - Live mode: python predictor.py")
    print("  - Test mode: python predictor.py test")
    print("  - In code:   from src.predictor import PricePredictor")
    
    return True


if __name__ == "__main__":
    try:
        success = test_predictor_basic()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
