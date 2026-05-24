#[test_only]
module anima::anima_tests;

use anima::protocol::{Self, ANIMA, OwnerCap};
use anima::skill_registry;
use anima::wallet;
use std::string;
use sui::balance;
use sui::coin;
use sui::sui::SUI;
use sui::test_scenario::{Self, Scenario};

// --- Test Utilities ---
const GUARDIAN_ADDR: address = @0xA11CE;
const BACKEND_ADDR: address = @0xB0B;
const MALICIOUS_ADDR: address = @0xBAD;

fun setup_test(): (Scenario, ANIMA, OwnerCap) {
    let mut scenario = test_scenario::begin(GUARDIAN_ADDR);

    // 1. Execute the initial agent container initialization block
    let (agent, cap) = protocol::mint_agent(
        string::utf8(b"Anima_Cortex_v1"),
        test_scenario::ctx(&mut scenario),
    );

    (scenario, agent, cap)
}

// --- Test Suites ---

#[test]
fun test_initialization_flow() {
    let (scenario, agent, cap) = setup_test();

    // Assert structural state records are initialized cleanly
    assert!(!protocol::is_paused(&agent), 0);
    assert!(protocol::reputation_score(&agent) == 100, 1);

    // Clean up test objects
    std::unit_test::destroy(agent);
    std::unit_test::destroy(cap);
    test_scenario::end(scenario);
}

#[test]
fun test_deposit_and_settlement_loops() {
    let (mut scenario, mut agent, cap) = setup_test();

    // 1. Emulate depositing 500 SUI into the container balance
    let test_mint_ctx = test_scenario::ctx(&mut scenario);
    let funding_tokens = coin::mint_for_testing<SUI>(500, test_mint_ctx);
    wallet::deposit_funds(&mut agent, funding_tokens);

    // 2. Validate that the capital landed inside the internal wallet
    let wallet_ref = protocol::borrow_balance_mut(&mut agent);
    assert!(balance::value(wallet_ref) == 500, 0);

    // 3. Trigger a V1 compute settlement to the background host node address
    test_scenario::next_tx(&mut scenario, BACKEND_ADDR);
    protocol::settle_compute_costs(
        &mut agent,
        50,
        BACKEND_ADDR,
        test_scenario::ctx(&mut scenario),
    );

    // 4. Assert balances reflect the exact cost draw down
    let post_wallet_ref = protocol::borrow_balance_mut(&mut agent);
    assert!(balance::value(post_wallet_ref) == 450, 1);

    std::unit_test::destroy(agent);
    std::unit_test::destroy(cap);
    test_scenario::end(scenario);
}

#[test]
fun test_dynamic_field_skill_registry() {
    let (mut scenario, mut agent, cap) = setup_test();

    let skill_name = string::utf8(b"DeepBook_Arb_Core");
    let blob_id = string::utf8(b"walrus_blob_hash_0x8821a");

    // 1. Authorize a dynamic skill manifest using the OwnerCap certificate
    skill_registry::authorize_skill(&mut agent, skill_name, blob_id, &cap);

    // 2. Read back the skill configuration using the view wrapper path
    let recorded_blob = skill_registry::read_skill_blob(&agent, skill_name);
    assert!(recorded_blob == blob_id, 0);

    // 3. Update the dynamic skill tracking hash to point to new model weights
    let updated_blob_id = string::utf8(b"walrus_blob_hash_updated_0x9943b");
    skill_registry::update_skill_manifest(&mut agent, skill_name, updated_blob_id, &cap);

    let verified_blob = skill_registry::read_skill_blob(&agent, skill_name);
    assert!(verified_blob == updated_blob_id, 1);

    std::unit_test::destroy(agent);
    std::unit_test::destroy(cap);
    test_scenario::end(scenario);
}

#[test]
fun test_emergency_kill_switch_hatch() {
    let (mut scenario, mut agent, cap) = setup_test();

    // 1. Seed the internal sovereign balance with tokens
    let funding_tokens = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
    wallet::deposit_funds(&mut agent, funding_tokens);

    // 2. Human Guardian calls the emergency kill switch using their unique capability certificate
    test_scenario::next_tx(&mut scenario, GUARDIAN_ADDR);
    protocol::trigger_emergency_kill(&mut agent, &cap, test_scenario::ctx(&mut scenario));

    // 3. Assert binary isolation states are enforced on-chain
    assert!(protocol::is_paused(&agent), 0);

    // 4. Assert that the agent container wallet balance was wiped and successfully returned to guardian address
    let drained_wallet_ref = protocol::borrow_balance_mut(&mut agent);
    assert!(balance::value(drained_wallet_ref) == 0, 1);

    std::unit_test::destroy(agent);
    std::unit_test::destroy(cap);
    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = anima::protocol::EAgentIsPaused)]
fun test_post_kill_switch_spend_refusal() {
    let (mut scenario, mut agent, cap) = setup_test();

    // 1. Execute kill switch execution block
    protocol::trigger_emergency_kill(&mut agent, &cap, test_scenario::ctx(&mut scenario));

    // 2. Emulate an autonomous bot context attempting to trigger a spend while paused
    test_scenario::next_tx(&mut scenario, MALICIOUS_ADDR);
    let spending_coin = wallet::extract_funds_for_action(
        &mut agent,
        100,
        test_scenario::ctx(&mut scenario),
    );

    std::unit_test::destroy(spending_coin);
    std::unit_test::destroy(agent);
    std::unit_test::destroy(cap);
    test_scenario::end(scenario);
}
