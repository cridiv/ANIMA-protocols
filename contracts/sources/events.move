module anima::events;

use sui::coin::Coin;
use sui::event;
use sui::sui::SUI;

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

public struct AgentActionExecuted has copy, drop {
    anima_id: ID,
    amount_swapped: u64,
}

public fun emit_anima_minted(anima_id: ID, owner: address) {
    event::emit(AnimaMinted { anima_id, owner });
}

public fun emit_emergency_hatch(anima_id: ID, guardian: address, recovered_amount: u64) {
    event::emit(EmergencyHatchTriggered { anima_id, guardian, recovered_amount });
}

public fun emit_compute_settled(anima_id: ID, amount: u64) {
    event::emit(ComputeSettled { anima_id, amount });
}

/// Primary action emission.
public fun emit_action(anima_id: ID, swap_result: &Coin<SUI>) {
    let amount_swapped = swap_result.value();

    event::emit(AgentActionExecuted {
        anima_id,
        amount_swapped,
    });
}
