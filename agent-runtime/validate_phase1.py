#!/usr/bin/env python
"""
ANIMA Agent Runtime - Phase 1 Validation Script

This script validates all Phase 1 deliverables and ensures everything is in place.
Run this after setup to confirm everything is working.
"""

import os
import sys
import asyncio
from pathlib import Path


def check_files():
    """Verify all required Phase 1 files exist."""
    base_path = Path(__file__).parent
    required_files = [
        "main.py",
        "monitor.py",
        "walrus_client.py",
        "test_phase1.py",
        "skill_schema.json",
        ".env.template",
        "requirements.txt",
        "README_PHASE1.md",
    ]
    
    print("\n📁 Checking Required Files")
    print("-" * 50)
    
    all_exist = True
    for filename in required_files:
        filepath = base_path / filename
        if filepath.exists():
            size = filepath.stat().st_size
            print(f"✅ {filename:<25} ({size:>6} bytes)")
        else:
            print(f"❌ {filename:<25} MISSING!")
            all_exist = False
    
    return all_exist


def check_imports():
    """Verify all Python modules can be imported."""
    print("\n🐍 Checking Python Imports")
    print("-" * 50)
    
    modules_to_check = [
        ("monitor", "PriceMonitor"),
        ("walrus_client", "WalrusClient, SkillConfig"),
    ]
    
    all_ok = True
    for module_name, classes in modules_to_check:
        try:
            __import__(module_name)
            print(f"✅ {module_name:<20} ({classes})")
        except ImportError as e:
            print(f"❌ {module_name:<20} FAILED: {e}")
            all_ok = False
    
    return all_ok


async def check_api_connectivity():
    """Verify CoinGecko API is reachable."""
    print("\n🌐 Checking API Connectivity")
    print("-" * 50)
    
    try:
        from monitor import PriceMonitor
        monitor = PriceMonitor(poll_interval=30)
        
        print("  Testing CoinGecko API...")
        price_data = await monitor.get_price("sui")
        
        if price_data:
            print(f"✅ CoinGecko API working")
            print(f"   SUI Price: ${price_data.price}")
            return True
        else:
            print(f"❌ CoinGecko API returned no data")
            return False
    except Exception as e:
        print(f"❌ API check failed: {e}")
        return False


async def check_walrus_roundtrip():
    """Verify Walrus round-trip test works."""
    print("\n📤 Checking Walrus Round-Trip")
    print("-" * 50)
    
    try:
        from walrus_client import WalrusRoundTripTest
        result = await WalrusRoundTripTest.run()
        return result
    except Exception as e:
        print(f"❌ Walrus test failed: {e}")
        return False


def check_configuration():
    """Verify configuration template exists."""
    print("\n⚙️  Checking Configuration")
    print("-" * 50)
    
    base_path = Path(__file__).parent
    env_template = base_path / ".env.template"
    env_file = base_path / ".env"
    
    if env_template.exists():
        print("✅ .env.template exists")
    else:
        print("❌ .env.template missing!")
        return False
    
    if not env_file.exists():
        print("⚠️  .env not found (copy from .env.template)")
    else:
        print("✅ .env file exists")
    
    return True


async def run_validation():
    """Run all validation checks."""
    print("\n" + "=" * 60)
    print("ANIMA AGENT RUNTIME - PHASE 1 VALIDATION")
    print("=" * 60)
    
    results = {
        "Files": check_files(),
        "Imports": check_imports(),
        "CoinGecko API": await check_api_connectivity(),
        "Walrus Round-Trip": await check_walrus_roundtrip(),
        "Configuration": check_configuration(),
    }
    
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    for check, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{check:<25} {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL VALIDATIONS PASSED!")
        print("Phase 1 is ready for deployment.")
    else:
        print("❌ Some validations failed. See above for details.")
    print("=" * 60 + "\n")
    
    return all_passed


if __name__ == "__main__":
    try:
        result = asyncio.run(run_validation())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"\n❌ Validation script error: {e}")
        sys.exit(1)
