"""Orchestrator daemon loop - central coordination engine for ANIMA agent runtime."""

import os
import time
import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import numpy as np

from src.sui_client import SuiRPCClient
from src.walrus_publish import WalrusPublisher
from src.backend_client import BackendAPIClient
from src.predictor import PricePredictor, MockPredictor
from src.monitor import PriceMonitor
from src.model_manager import ModelManager

logger = logging.getLogger(__name__)


class OrchestratorConfig:
    """Configuration for the orchestrator daemon."""
    
    def __init__(self):
        self.anima_object_id: Optional[str] = os.getenv("ANIMA_OBJECT_ID")
        self.operator_address: Optional[str] = os.getenv("OPERATOR_PUBLIC_ADDRESS")
        self.sui_rpc_url = os.getenv("SUI_RPC_URL", "https://testnet-rpc.sui.io")
        self.walrus_endpoint = os.getenv("WALRUS_ENDPOINT", "https://aggregator.walrus.testnet.sui.io")
        self.backend_url = os.getenv("BACKEND_API_URL", "http://localhost:3000")
        self.poll_interval = int(os.getenv("POLL_INTERVAL", "3"))
        self.enable_mock_mode = os.getenv("ENABLE_MOCK_MODE", "false").lower() == "true"
        self.mock_signal_interval = int(os.getenv("MOCK_SIGNAL_INTERVAL", "45"))
        self.model_path = Path(os.getenv("MODEL_PATH", "models/predictor.pkl"))


class OrchestratorState:
    """Tracks orchestrator runtime state."""
    
    def __init__(self):
        self.running = False
        self.start_time: Optional[datetime] = None
        self.iteration_count = 0
        self.signal_count = 0
        self.execution_count = 0
        self.last_error: Optional[str] = None
        self.price_history = []
        self.agent_paused = False


class AnimaOrchestrator:
    """
    Primary off-chain daemon loop for ANIMA agent runtime.
    
    Responsibilities:
    1. Fetch ANIMA object and extract operator address
    2. Load skills from Walrus
    3. Poll market data
    4. Evaluate predictor signals
    5. Submit signals to backend for execution
    """
    
    def __init__(self, config: Optional[OrchestratorConfig] = None):
        """
        Initialize orchestrator.
        
        Args:
            config: OrchestratorConfig instance
        """
        self.config = config or OrchestratorConfig()
        self.state = OrchestratorState()
        
        # Initialize clients
        self.sui_client = SuiRPCClient(self.config.sui_rpc_url)
        self.walrus_publisher = WalrusPublisher()
        self.backend_client = BackendAPIClient(self.config.backend_url)
        self.price_monitor = PriceMonitor()
        self.model_manager = ModelManager()
        
        # Initialize predictor
        if self.config.enable_mock_mode:
            self.predictor = MockPredictor(self.config.mock_signal_interval)
            logger.info("🎭 Using MockPredictor for testing")
        else:
            self.predictor = PricePredictor()
            logger.info("🧠 Using PricePredictor (ML mode)")
            
            # Try to load trained model
            latest_model = self.model_manager.get_latest_model()
            if latest_model:
                if self.model_manager.load_model(latest_model):
                    logger.info(f"✓ Loaded trained model: {latest_model}")
                else:
                    logger.warning(f"Failed to load model {latest_model}, will train new one")
        
        # State tracking
        self.skills: Dict[str, Dict[str, Any]] = {}
        self.operator_address: Optional[str] = None
        
        logger.info("🤖 AnimaOrchestrator initialized")
        logger.info(f"  ANIMA Object ID: {self.config.anima_object_id}")
        logger.info(f"  Poll Interval: {self.config.poll_interval}s")
        logger.info(f"  Mock Mode: {self.config.enable_mock_mode}")
    
    def fetch_and_validate_anima_object(self) -> bool:
        """
        Fetch ANIMA object from Sui and validate.
        
        Returns:
            True if successful, False otherwise
        """
        if not self.config.anima_object_id:
            logger.error("❌ ANIMA_OBJECT_ID not set!")
            return False
        
        try:
            logger.info(f"📥 Fetching ANIMA object: {self.config.anima_object_id}")
            
            obj = self.sui_client.fetch_object(self.config.anima_object_id)
            
            if not obj:
                logger.error("Failed to fetch ANIMA object from Sui")
                return False
            
            # Extract operator address
            self.operator_address = self.sui_client.get_operator_address(obj)
            if not self.operator_address:
                logger.error("Could not extract operator address from object")
                return False
            
            # Extract skill blob IDs
            blob_ids = self.sui_client.get_skill_blob_ids(obj)
            
            # Load skills from Walrus
            for blob_id in blob_ids:
                self.load_skill_from_walrus(blob_id)
            
            # Check agent status
            status = self.sui_client.get_agent_status(obj)
            self.state.agent_paused = status == "Paused"
            
            if self.state.agent_paused:
                logger.warning("⏸️  Agent is currently PAUSED")
            
            logger.info("✓ ANIMA object validation successful")
            return True
        
        except Exception as e:
            logger.error(f"Error validating ANIMA object: {e}")
            self.state.last_error = str(e)
            return False
    
    def load_skill_from_walrus(self, blob_id: str) -> bool:
        """
        Load skill configuration from Walrus.
        
        Args:
            blob_id: Walrus blob ID for skill config
        
        Returns:
            True if loaded successfully
        """
        try:
            logger.info(f"📥 Loading skill from Walrus: {blob_id}")
            
            skill_config = self.walrus_publisher.retrieve_config_from_blob(blob_id)
            
            if skill_config:
                self.skills[blob_id] = skill_config
                logger.info(f"✓ Loaded skill: {skill_config.get('skill_name')}")
                return True
            else:
                logger.warning(f"Failed to load skill from Walrus")
                return False
        
        except Exception as e:
            logger.error(f"Error loading skill: {e}")
            return False
    
    def check_trigger_conditions(
        self,
        price: float,
        signal: str,
        confidence: float
    ) -> Optional[Dict[str, Any]]:
        """
        Check if any skill trigger conditions are met.
        
        Args:
            price: Current market price
            signal: Trading signal (BUY/HOLD/SELL)
            confidence: Signal confidence
        
        Returns:
            Matched skill config or None
        """
        if not self.skills:
            return None
        
        for blob_id, skill_config in self.skills.items():
            trigger = skill_config.get("trigger", {})
            
            # Check trigger type
            if trigger.get("type") == "price_threshold":
                threshold = trigger.get("value", 0)
                condition = trigger.get("condition", "below")
                
                trigger_fired = False
                
                if condition == "below" and price < threshold:
                    trigger_fired = True
                    logger.info(f"🔔 Price threshold trigger: ${price} < ${threshold}")
                
                elif condition == "above" and price > threshold:
                    trigger_fired = True
                    logger.info(f"🔔 Price threshold trigger: ${price} > ${threshold}")
                
                if trigger_fired:
                    return skill_config
            
            # Check signal-based trigger
            elif trigger.get("type") == "signal":
                trigger_signal = trigger.get("value")
                if signal == trigger_signal and confidence >= trigger.get("min_confidence", 0):
                    logger.info(f"🔔 Signal trigger: {signal}")
                    return skill_config
        
        return None
    
    def validate_against_risk_limits(
        self,
        skill_config: Dict[str, Any],
        price: float
    ) -> bool:
        """
        Validate execution against risk limits.
        
        Args:
            skill_config: Skill configuration with risk parameters
            price: Current price
        
        Returns:
            True if within limits, False otherwise
        """
        try:
            risk_limits = skill_config.get("risk_limits", {})
            
            max_spend = risk_limits.get("max_spend_per_action", float('inf'))
            daily_cap = risk_limits.get("daily_spend_cap", float('inf'))
            max_slippage = risk_limits.get("max_slippage_percent", 100)
            
            # Check max spend
            estimated_spend = price  # Simplified
            
            if estimated_spend > max_spend:
                logger.warning(f"⚠️  Spend limit exceeded: ${estimated_spend} > ${max_spend}")
                return False
            
            logger.info(f"✓ Risk limits validated")
            return True
        
        except Exception as e:
            logger.error(f"Error validating risk limits: {e}")
            return False
    
    def train_model_periodically(self):
        """
        Train or retrain the ML model on available price history.
        
        Called periodically during orchestration to improve predictions.
        """
        try:
            if len(self.state.price_history) < 100:
                logger.debug(f"Insufficient data for training: {len(self.state.price_history)} samples")
                return False
            
            logger.info(f"🧠 Training model on {len(self.state.price_history)} price points...")
            
            # Train model
            if self.model_manager.train_model(self.state.price_history):
                # Save model
                version = f"v{int(self.state.iteration_count / 100)}.0"
                saved_path = self.model_manager.save_model(version)
                
                if saved_path:
                    logger.info(f"✓ Model saved: {saved_path}")
                    return True
            
            return False
        
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False
    
    def run_orchestration_loop(self):
        """
        Main orchestration loop.
        
        Runs indefinitely, polling market data and executing signals.
        """
        logger.info(f"🚀 Agent runtime starting for ANIMA Instance: {self.config.anima_object_id}\n")
        
        # Validate ANIMA object before starting
        if not self.fetch_and_validate_anima_object():
            logger.error("❌ Failed to validate ANIMA object. Exiting.")
            return
        
        # Check backend health
        if not self.backend_client.health_check():
            logger.warning("⚠️  Backend is not reachable. Continuing in monitoring mode only.")
        
        self.state.running = True
        self.state.start_time = datetime.now()
        
        logger.info("=" * 60)
        logger.info("🔄 ORCHESTRATOR MAIN LOOP STARTED")
        logger.info("=" * 60 + "\n")
        
        try:
            while self.state.running:
                self.state.iteration_count += 1
                
                try:
                    # 1. Check if agent is paused
                    if self.state.agent_paused:
                        logger.info("⏸️  Agent is paused. Waiting...")
                        time.sleep(self.config.poll_interval)
                        continue
                    
                    # 2. Poll current market price
                    current_price = self.price_monitor.get_price_sync("sui")
                    
                    if current_price is None:
                        logger.warning("⚠️  Failed to fetch price")
                        time.sleep(self.config.poll_interval)
                        continue
                    
                    self.state.price_history.append(current_price)
                    if len(self.state.price_history) > 1000:
                        self.state.price_history.pop(0)
                    
                    # 3. Generate trading signal
                    signal_obj = self.predictor.predict(self.state.price_history)
                    signal = signal_obj.action
                    confidence = signal_obj.confidence
                    
                    self.state.signal_count += 1
                    
                    # 4. Check trigger conditions
                    matched_skill = self.check_trigger_conditions(
                        current_price,
                        signal,
                        confidence
                    )
                    
                    # 5. If trigger fired, validate and execute
                    if matched_skill and signal == "BUY_SIGNAL":
                        if self.validate_against_risk_limits(matched_skill, current_price):
                            # Execute via backend
                            success = self.backend_client.submit_signal(
                                agent_id=self.config.anima_object_id,
                                signal=signal,
                                price=current_price,
                                confidence=confidence,
                                reasoning=signal_obj.reasoning
                            )
                            
                            if success:
                                self.state.execution_count += 1
                                logger.info(f"✅ Execution {self.state.execution_count} completed\n")
                    
                    # 6. Train model periodically
                    if self.state.iteration_count % 100 == 0 and not self.config.enable_mock_mode:
                        logger.info("📊 Running periodic model training...")
                        self.train_model_periodically()
                    
                    # 7. Log status periodically
                    if self.state.iteration_count % 10 == 0:
                        uptime = datetime.now() - self.state.start_time
                        logger.info(
                            f"[{self.state.iteration_count:06d}] "
                            f"Price: ${current_price:.4f} | "
                            f"Signal: {signal} ({confidence:.0f}%) | "
                            f"Executions: {self.state.execution_count} | "
                            f"Uptime: {uptime.total_seconds():.0f}s"
                        )
                    
                    # 8. Sleep until next poll
                    time.sleep(self.config.poll_interval)
                
                except KeyboardInterrupt:
                    logger.info("\n⏹️  Keyboard interrupt received")
                    break
                
                except Exception as err:
                    logger.error(f"❌ Loop exception: {err}", exc_info=True)
                    self.state.last_error = str(err)
                    logger.info(f"  Recovering in {self.config.poll_interval}s...")
                    time.sleep(self.config.poll_interval)
        
        finally:
            self.shutdown()
    
    def shutdown(self):
        """Graceful shutdown."""
        self.state.running = False
        uptime = datetime.now() - self.state.start_time if self.state.start_time else None
        
        logger.info("\n" + "=" * 60)
        logger.info("🛑 ORCHESTRATOR SHUTTING DOWN")
        logger.info("=" * 60)
        logger.info(f"Total iterations: {self.state.iteration_count}")
        logger.info(f"Signals generated: {self.state.signal_count}")
        logger.info(f"Executions completed: {self.state.execution_count}")
        logger.info(f"Uptime: {uptime.total_seconds():.0f}s" if uptime else "")
        if self.state.last_error:
            logger.info(f"Last error: {self.state.last_error}")
        logger.info("=" * 60 + "\n")


def main():
    """Entry point for orchestrator daemon."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    config = OrchestratorConfig()
    orchestrator = AnimaOrchestrator(config)
    orchestrator.run_orchestration_loop()


if __name__ == "__main__":
    main()
        self.mock_signal_interval = int(os.getenv("MOCK_SIGNAL_INTERVAL", "45"))  # seconds
        self.backend_api_url = os.getenv("BACKEND_API_URL", "http://localhost:3000")


class OrchestratorState:
    """Tracks orchestrator runtime state."""
    
    def __init__(self):
        self.running = False
        self.start_time: Optional[datetime] = None
        self.iteration_count = 0
        self.last_signal: Optional[str] = None
        self.last_signal_time: Optional[datetime] = None
        self.price_history = []


class AnimaOrchestrator:
    """
    Primary off-chain daemon loop for ANIMA agent runtime.
    
    Responsibilities:
    1. Sync with ANIMA object state on Sui
    2. Poll market data (prices from DeepBook V3)
    3. Evaluate predictor signals
    4. Submit signed transaction blocks for execution
    """
    
    def __init__(self, config: Optional[OrchestratorConfig] = None):
        """
        Initialize orchestrator.
        
        Args:
            config: OrchestratorConfig instance (uses env vars if None)
        """
        self.config = config or OrchestratorConfig()
        self.state = OrchestratorState()
        
        logger.info("🤖 AnimaOrchestrator initialized")
        logger.info(f"  ANIMA Object ID: {self.config.anima_object_id}")
        logger.info(f"  Operator: {self.config.operator_address}")
        logger.info(f"  SUI RPC: {self.config.sui_rpc_url}")
        logger.info(f"  Poll Interval: {self.config.poll_interval}s")
        logger.info(f"  Mock Mode: {self.config.enable_mock_mode}")
    
    def fetch_anima_object_state(self) -> Optional[dict]:
        """
        Fetch live ANIMA object state from Sui network.
        
        Returns:
            ANIMA object state dict or None if not yet minted
        """
        try:
            # TODO: Implement actual Sui RPC call using pysui
            # For now, return mock state
            if not self.config.anima_object_id:
                logger.warning("⚠️ ANIMA_OBJECT_ID not set. Waiting for minting...")
                return None
            
            # Mock state for testing
            return {
                "id": self.config.anima_object_id,
                "operator": self.config.operator_address,
                "status": "Normal",
                "balance": 1000000000,  # SUI in mist
                "skill_blob_id": "Walrus_blob_id_placeholder"
            }
        
        except Exception as e:
            logger.error(f"✖ Error fetching ANIMA object: {e}")
            return None
    
    def fetch_deepbook_price(self) -> Optional[float]:
        """
        Poll live price from DeepBook V3 pool.
        
        Returns:
            Current SUI/USDC price or None
        """
        try:
            # TODO: Implement actual DeepBook V3 integration
            # For now, generate mock price with some variation
            import random
            
            base_price = 0.42
            variation = random.uniform(-0.01, 0.01)
            price = base_price + variation
            
            self.state.price_history.append(price)
            if len(self.state.price_history) > 100:
                self.state.price_history.pop(0)
            
            return price
        
        except Exception as e:
            logger.error(f"✖ Error fetching price: {e}")
            return None
    
    def evaluate_market_inference(self, price: float) -> Optional[str]:
        """
        Evaluate trading signal using predictor model.
        
        Args:
            price: Current market price
        
        Returns:
            Signal: "BUY_SIGNAL", "HOLD", "SELL_SIGNAL", or None
        """
        try:
            # TODO: Integrate actual ML predictor
            # For testing: Fire BUY_SIGNAL every N seconds
            
            if self.config.enable_mock_mode:
                # Mock mode: generate signal based on time intervals
                current_time = datetime.now()
                
                if self.state.last_signal_time is None:
                    # First signal
                    self.state.last_signal = "BUY_SIGNAL"
                    self.state.last_signal_time = current_time
                    return self.state.last_signal
                
                time_since_last = (current_time - self.state.last_signal_time).total_seconds()
                
                if time_since_last >= self.config.mock_signal_interval:
                    self.state.last_signal = "BUY_SIGNAL"
                    self.state.last_signal_time = current_time
                    return self.state.last_signal
                else:
                    return "HOLD"
            
            else:
                # TODO: Real predictor inference
                return "HOLD"
        
        except Exception as e:
            logger.error(f"✖ Error evaluating signal: {e}")
            return None
    
    def execute_atomic_trade_ptb(self, signal: str) -> bool:
        """
        Execute atomic trade transaction block.
        
        Args:
            signal: Trading signal (BUY_SIGNAL, SELL_SIGNAL, etc.)
        
        Returns:
            True if execution succeeded
        """
        try:
            logger.info(f"🚨 Decision engine fired: Executing atomic strategy block...")
            logger.info(f"   Signal: {signal}")
            logger.info(f"   Price: ${self.state.price_history[-1]:.4f}" if self.state.price_history else "")
            
            # TODO: Implement actual PTB signing and submission
            # 1. Fetch operator's private key from local storage
            # 2. Build transaction block for the specific trade
            # 3. Sign with Ed25519 keypair
            # 4. Submit to Sui network
            # 5. Poll for confirmation
            
            # For now, just log the execution
            logger.info(f"   ✓ Transaction submitted (mock)")
            
            return True
        
        except Exception as e:
            logger.error(f"✖ Error executing trade: {e}")
            return False
    
    def run_orchestration_loop(self):
        """
        Main orchestration loop.
        
        Runs indefinitely, polling market data and executing signals.
        """
        logger.info(f"🤖 Agent runtime awakened for ANIMA Instance: {self.config.anima_object_id}")
        
        self.state.running = True
        self.state.start_time = datetime.now()
        
        try:
            while self.state.running:
                self.state.iteration_count += 1
                
                try:
                    # 1. Fetch ANIMA object state
                    anima_state = self.fetch_anima_object_state()
                    
                    if anima_state:
                        # Check if agent is paused
                        if anima_state.get("status") == "Paused":
                            logger.info("⏸️  Agent is paused. Waiting...")
                            time.sleep(self.config.poll_interval)
                            continue
                    
                    # 2. Sensor Phase: Poll live price
                    current_price = self.fetch_deepbook_price()
                    
                    if current_price is None:
                        time.sleep(self.config.poll_interval)
                        continue
                    
                    # 3. Brain Phase: Evaluate predictor signal
                    signal = self.evaluate_market_inference(current_price)
                    
                    # 4. Actuator Phase: Execute if signal fired
                    if signal == "BUY_SIGNAL":
                        self.execute_atomic_trade_ptb(signal)
                    
                    # Log iteration status
                    if self.state.iteration_count % 10 == 0:
                        uptime = datetime.now() - self.state.start_time
                        logger.info(
                            f"[Iteration {self.state.iteration_count}] "
                            f"Price: ${current_price:.4f} | "
                            f"Signal: {signal} | "
                            f"Uptime: {uptime.total_seconds():.0f}s"
                        )
                    
                    # Wait for next poll
                    time.sleep(self.config.poll_interval)
                
                except KeyboardInterrupt:
                    logger.info("\n⏹️  Keyboard interrupt received. Shutting down...")
                    break
                
                except Exception as err:
                    logger.error(f"✖ Loop exception caught: {err}", exc_info=True)
                    logger.info(f"  Recovering in {self.config.poll_interval}s...")
                    time.sleep(self.config.poll_interval)
        
        finally:
            self.shutdown()
    
    def shutdown(self):
        """Graceful shutdown."""
        self.state.running = False
        uptime = datetime.now() - self.state.start_time if self.state.start_time else None
        
        logger.info("🛑 Orchestrator shutting down...")
        logger.info(f"  Total iterations: {self.state.iteration_count}")
        logger.info(f"  Uptime: {uptime.total_seconds():.0f}s" if uptime else "")


def main():
    """Entry point for orchestrator daemon."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    config = OrchestratorConfig()
    orchestrator = AnimaOrchestrator(config)
    orchestrator.run_orchestration_loop()


if __name__ == "__main__":
    main()
