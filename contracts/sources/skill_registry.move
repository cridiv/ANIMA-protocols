module anima::skill_registry;

use anima::protocol::{Self, ANIMA, OwnerCap};
use std::string::String;
use sui::dynamic_field as df;

// --- Errors ---
const ESkillAlreadyExists: u64 = 1;
const ESkillNotFound: u64 = 2;

public struct SkillKey(String) has copy, drop, store;

// --- Public Executions ---

/// Appends a new operational skill capability (storing its unique Walrus Blob ID)
/// directly to the agent's identity object. Controlled by the OwnerCap guardian certificate.
public fun authorize_skill(
    agent: &mut ANIMA,
    cap: &OwnerCap,
    skill_name: String,
    walrus_blob_id: String,
) {
    // 1. Enforce operational status and verify that the OwnerCap corresponds to this explicit ANIMA ID
    protocol::assert_not_paused(agent);
    protocol::check_owner_cap(agent, cap);

    let key = SkillKey(skill_name);
    assert!(!df::exists_(protocol::borrow_uid_mut(agent), key), ESkillAlreadyExists);

    // 2. Attach the skill payload via dynamic field linkage
    df::add(protocol::borrow_uid_mut(agent), key, walrus_blob_id);
}

/// Overwrites or updates an existing skill config mapping with a newly generated Walrus Blob ID.
public fun update_skill_manifest(
    agent: &mut ANIMA,
    cap: &OwnerCap,
    skill_name: String,
    new_walrus_blob_id: String,
) {
    protocol::assert_not_paused(agent);
    protocol::check_owner_cap(agent, cap);

    let key = SkillKey(skill_name);
    let uid_mut = protocol::borrow_uid_mut(agent);
    assert!(df::exists_(uid_mut, key), ESkillNotFound);

    // Dynamic field mutation: borrow reference and update content in-place
    let blob_ref = df::borrow_mut<SkillKey, String>(uid_mut, key);
    *blob_ref = new_walrus_blob_id;
}

/// revokes an operational capability entirely, removing the dynamic field mapping allocation.
public fun revoke_skill(agent: &mut ANIMA, cap: &OwnerCap, skill_name: String) {
    protocol::assert_not_paused(agent);
    protocol::check_owner_cap(agent, cap);

    let key = SkillKey(skill_name);
    let uid_mut = protocol::borrow_uid_mut(agent);
    assert!(df::exists_(uid_mut, key), ESkillNotFound);

    // Drop the dynamic field linkage allocation completely
    df::remove<SkillKey, String>(uid_mut, key);
}

// --- View Primitives (Read-Only Path for Ezekiel and Ademola) ---

/// Fetches the target Walrus Blob ID associated with a specified skill name.
public fun read_skill_blob(agent: &ANIMA, skill_name: String): String {
    // Note: We bypass status checking here so the data explorer can read logs even if paused
    let key = SkillKey(skill_name);
    let uid = protocol::borrow_uid(agent);
    assert!(df::exists_(uid, key), ESkillNotFound);

    *df::borrow<SkillKey, String>(uid, key)
}
