module anima::wallet;

use anima::protocol::{Self, ANIMA};
use sui::balance;
use sui::coin::{Self, Coin};
use sui::sui::SUI;

// --- Errors ---
const EInsufficientFundsAllocation: u64 = 1;

// --- Public Executions ---

/// Public Entry Point: Allows any external wallet, protocol, or human guardian
/// to deposit SUI directly into the agent's internal sovereign vault balance.
public fun deposit_funds(agent: &mut ANIMA, funding_coin: Coin<SUI>) {
    // Check if the agent is active before allowing deposits
    protocol::assert_not_paused(agent);

    // Unpack the coin into its underlying balance representation
    let funding_balance = coin::into_balance(funding_coin);

    // Safely route the balance to the package-internal mutator
    protocol::mutate_balance(agent, funding_balance);
}

/// Core PTB Primitive Path: Extracts a precise amount of SUI from the agent container
/// to execute on-chain strategies (e.g., swapping on DeepBook).
///
/// Note: This returns a `Coin<SUI>` that MUST be spent or routed elsewhere within the
/// same Programmable Transaction Block—Move's resource safety rules guarantee it cannot leak.
public fun extract_funds_for_action(
    agent: &mut ANIMA,
    amount: u64,
    ctx: &mut TxContext,
): Coin<SUI> {
    // 1. Enforce that the state machine is active
    protocol::assert_not_paused(agent);

    // 2. Safely borrow a mutable pointer to the encapsulated wallet balance
    let agent_balance_mut = protocol::borrow_balance_mut(agent);

    // 3. Assert economic constraints before attempting extraction
    assert!(balance::value(agent_balance_mut) >= amount, EInsufficientFundsAllocation);

    // 4. Slice out the specific token amount and return it as a concrete Coin resource
    coin::take(agent_balance_mut, amount, ctx)
}
