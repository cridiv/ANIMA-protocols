module anima::protocol;

use std::string::String;
use sui::balance::{Self, Balance};
use sui::coin;
use sui::event;
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

// --- Structural Verification Events ---

public struct AnimaMinted has copy, drop {
    anima_id: ID,
    owner: address,
}

public struct EmergencyHatchTriggered has copy, drop {
    anima_id: ID,
    guardian: address,
    recovered_amount: u64,
}

public struct ComputeSettled has copy, drop {
    anima_id: ID,
    amount: u64,
}

// --- Public Executions ---

/// Primary entry point: Instantiates an agent identity, configures an empty internal vault,
/// and delivers the remote control access capability to the user's wallet address.
public fun mint_agent(name: String, ctx: &mut TxContext): (ANIMA, OwnerCap) {
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

    event::emit(AnimaMinted { anima_id, owner: sender });

    (agent, cap)
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

    event::emit(EmergencyHatchTriggered {
        anima_id: cap.anima_id,
        guardian: sender,
        recovered_amount: total_assets,
    });
}

/// V1 Off-Chain Compute Cost Settlement Mechanism
public fun settle_compute_costs(
    agent: &mut ANIMA,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(!agent.is_paused, EAgentIsPaused);
    assert!(balance::value(&agent.wallet_balance) >= amount, EInsufficientFunds);

    let payment = coin::take(&mut agent.wallet_balance, amount, ctx);
    sui::transfer::public_transfer(payment, recipient);

    event::emit(ComputeSettled {
        anima_id: object::uid_to_inner(&agent.id),
        amount,
    });
}

// --- Package Internal Interface (Friend-Utility Patterns) ---

/// Grants read access to check if the state machine is active
public fun assert_not_paused(agent: &ANIMA) {
    assert!(!agent.is_paused, EAgentIsPaused);
}

/// Grants access to read the internal identifier context
public fun borrow_uid_mut(agent: &mut ANIMA): &mut UID {
    &mut agent.id
}

/// Package-internal utility for structural balance deposits
public(package) fun mutate_balance(agent: &mut ANIMA, funding: Balance<SUI>) {
    balance::join(&mut agent.wallet_balance, funding);
}

/// Package-internal utility for extracting active execution balances
public(package) fun borrow_balance_mut(agent: &mut ANIMA): &mut Balance<SUI> {
    &mut agent.wallet_balance
}
