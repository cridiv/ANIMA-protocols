module anima::protocol;

use anima::events;
use std::string::String;
use sui::balance::{Self, Balance};
use sui::coin;
use sui::sui::SUI;

// --- Errors ---
const EAgentIsPaused: u64 = 1;
const EInvalidGuardianCertificate: u64 = 2;
const EInsufficientFunds: u64 = 3;

/// The core identity container making an AI agent a first-class citizen on Sui
public struct ANIMA has key, store {
    id: UID,
    name: String,
    reputation_score: u64,
    is_paused: bool,
    wallet_balance: Balance<SUI>,
}

/// Cryptographic key token given to the deploying human context for remote kill switch access
public struct OwnerCap has key, store {
    id: UID,
    anima_id: ID,
}

/// Capability given to the off-chain execution backend for compute fee settlement
public struct BackendCap has key, store {
    id: UID,
    anima_id: ID,
}

// --- Public Executions ---

/// Primary entry point: Instantiates an agent identity, configures an empty internal vault,
/// and delivers the remote control access capability to the user's wallet address.
public fun mint_agent(name: String, ctx: &mut TxContext): (ANIMA, OwnerCap, BackendCap) {
    let sender = tx_context::sender(ctx);
    let id = object::new(ctx);
    let anima_id = object::uid_to_inner(&id);

    let agent = ANIMA {
        id,
        name,
        reputation_score: 100, // Starts pristine
        is_paused: false,
        wallet_balance: balance::zero<SUI>(),
    };

    let cap = OwnerCap {
        id: object::new(ctx),
        anima_id,
    };

    let backend_cap = BackendCap {
        id: object::new(ctx),
        anima_id,
    };

    events::emit_anima_minted(anima_id, sender);

    (agent, cap, backend_cap)
}

/// Emergency Control Pattern: Instantly halts all autonomous routing operations
/// and dumps every drop of remaining SUI back to the Guardian wallet.
#[allow(lint(self_transfer))]
public fun trigger_emergency_kill(agent: &mut ANIMA, cap: &OwnerCap, ctx: &mut TxContext) {
    assert!(object::uid_to_inner(&agent.id) == cap.anima_id, EInvalidGuardianCertificate);

    agent.is_paused = true;
    let sender = tx_context::sender(ctx);
    let total_assets = balance::value(&agent.wallet_balance);

    // Take everything out of the agent vault
    let remaining_funds = coin::take(&mut agent.wallet_balance, total_assets, ctx);
    sui::transfer::public_transfer(remaining_funds, sender);

    events::emit_emergency_hatch(cap.anima_id, sender, total_assets);
}

/// V1 Off-Chain Compute Cost Settlement Mechanism. Only the authorized Backend can execute this.
public fun settle_compute_costs(
    agent: &mut ANIMA,
    cap: &BackendCap,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(!agent.is_paused, EAgentIsPaused);
    assert!(object::uid_to_inner(&agent.id) == cap.anima_id, EInvalidGuardianCertificate);
    assert!(balance::value(&agent.wallet_balance) >= amount, EInsufficientFunds);

    let payment = coin::take(&mut agent.wallet_balance, amount, ctx);
    sui::transfer::public_transfer(payment, recipient);

    events::emit_compute_settled(object::uid_to_inner(&agent.id), amount);
}

// --- Package Internal Interface (Friend-Utility Patterns) ---

/// Grants read access to check if the state machine is active
public fun assert_not_paused(agent: &ANIMA) {
    assert!(!agent.is_paused, EAgentIsPaused);
}

/// Grants read-only access to the reputation score
public fun reputation_score(agent: &ANIMA): u64 {
    agent.reputation_score
}

/// Grants read-only access to the is_paused status
public fun is_paused(agent: &ANIMA): bool {
    agent.is_paused
}

/// Package-internal utility for incrementing reputation score
public fun increment_reputation(agent: &mut ANIMA) {
    agent.reputation_score = agent.reputation_score + 1;
}

/// Primary action recording: Increments agent reputation score and emits the related action event
public fun record_action(agent: &mut ANIMA, swap_result: &sui::coin::Coin<SUI>) {
    increment_reputation(agent);
    events::emit_action(object::uid_to_inner(&agent.id), swap_result);
}

/// Grants access to read the internal identifier context
public fun borrow_uid_mut(agent: &mut ANIMA): &mut UID {
    &mut agent.id
}

/// Grants read-only access to the internal UID
public fun borrow_uid(agent: &ANIMA): &UID {
    &agent.id
}

/// Verifies that the given OwnerCap belongs to this ANIMA
public fun check_owner_cap(agent: &ANIMA, cap: &OwnerCap) {
    assert!(object::uid_to_inner(&agent.id) == cap.anima_id, EInvalidGuardianCertificate);
}

/// Package-internal utility for structural balance deposits
public(package) fun mutate_balance(agent: &mut ANIMA, funding: Balance<SUI>) {
    balance::join(&mut agent.wallet_balance, funding);
}

/// Package-internal utility for extracting active execution balances
public(package) fun borrow_balance_mut(agent: &mut ANIMA): &mut Balance<SUI> {
    &mut agent.wallet_balance
}
