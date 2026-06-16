import { SuiJsonRpcClient as SuiClient } from "@mysten/sui/jsonRpc";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const PACKAGE_ID = process.env.PACKAGE_ID || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper to fetch the latest agent state from Sui RPC and update Supabase
export async function syncAgentState(client: SuiClient, agentObjectId: string) {
  try {
    const response = await client.getObject({
      id: agentObjectId,
      options: { showContent: true },
    });

    if (response.data && response.data.content && response.data.content.dataType === "moveObject") {
      const fields = response.data.content.fields as any;
      const name = fields.name;
      const isPaused = fields.is_paused;
      const reputationScore = parseInt(fields.reputation_score || "0");
      const walletBalance = parseInt(fields.wallet_balance?.fields?.value || "0");

      const { error } = await supabase
        .from("agents")
        .update({
          name: name,
          is_paused: isPaused,
          reputation_score: reputationScore,
          wallet_balance: walletBalance,
        })
        .eq("object_id", agentObjectId);

      if (error) {
        console.error(`Error updating agent state for ${agentObjectId}:`, error);
      } else {
        console.log(`Synced on-chain state for agent ${name} (${agentObjectId})`);
      }
    }
  } catch (error) {
    console.error(`Failed to sync agent state for ${agentObjectId}:`, error);
  }
}

// Helper to sync global protocol stats
export async function syncGlobalStats() {
  try {
    // Count total, active, and paused agents
    const { count: totalAgents } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true });

    const { count: activeAgents } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_paused", false);

    const { count: pausedAgents } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_paused", true);

    // Sum total actions and total volume
    const { data: actionsData } = await supabase
      .from("agent_actions")
      .select("amount");

    const totalActions = actionsData ? actionsData.length : 0;
    const totalVolume = actionsData
      ? actionsData.reduce((acc, curr) => acc + BigInt(curr.amount || 0), BigInt(0)).toString()
      : "0";

    const { error } = await supabase
      .from("protocol_stats")
      .update({
        total_agents: totalAgents || 0,
        total_active: activeAgents || 0,
        total_paused: pausedAgents || 0,
        total_actions: totalActions,
        total_volume: totalVolume,
        updated_at: new Date(),
      })
      .eq("id", 1);

    if (error) {
      console.error("Error syncing global stats:", error);
    } else {
      console.log("Synced global protocol statistics.");
    }
  } catch (error) {
    console.error("Failed to sync global stats:", error);
  }
}

export async function handleAnimaMinted(client: SuiClient, event: any) {
  const { anima_id, owner } = event.parsedJson;
  const txDigest = event.id.txDigest;
  const checkpoint = parseInt(event.checkpoint || "0");

  console.log(`[Minted Event] Agent ID: ${anima_id}, Owner: ${owner}`);

  try {
    // Fetch transaction block to get OwnerCap ID from objectChanges
    let ownerCapId = "";
    const txBlock = await client.getTransactionBlock({
      digest: txDigest,
      options: { showObjectChanges: true },
    });

    if (txBlock.objectChanges) {
      for (const change of txBlock.objectChanges) {
        if (change.type === "created" && change.objectType === `${PACKAGE_ID}::protocol::OwnerCap`) {
          ownerCapId = change.objectId;
          break;
        }
      }
    }

    // Fetch the agent details from Sui
    const animaObject = await client.getObject({
      id: anima_id,
      options: { showContent: true },
    });

    let agentName = "Unknown Agent";
    let reputationScore = 100;
    let walletBalance = 0;

    if (animaObject.data && animaObject.data.content && animaObject.data.content.dataType === "moveObject") {
      const fields = animaObject.data.content.fields as any;
      agentName = fields.name;
      reputationScore = parseInt(fields.reputation_score || "100");
      walletBalance = parseInt(fields.wallet_balance?.fields?.value || "0");
    }

    // Insert new agent
    const { error } = await supabase.from("agents").upsert(
      {
        object_id: anima_id,
        name: agentName,
        owner_address: owner,
        owner_cap_id: ownerCapId || "unknown",
        is_paused: false,
        reputation_score: reputationScore,
        wallet_balance: walletBalance,
        minted_at_checkpoint: checkpoint,
        created_at: new Date(),
      },
      { onConflict: "object_id" }
    );

    if (error) {
      console.error(`Error inserting minted agent ${anima_id} to Supabase:`, error);
    } else {
      console.log(`Successfully indexed agent ${agentName} (${anima_id}) in Supabase`);
      
      // Log initial MINT action
      await supabase.from("agent_actions").insert({
        agent_object_id: anima_id,
        tx_digest: txDigest,
        action_type: "MINT",
        amount: 0,
        target_protocol: "AnimaProtocol",
        status: "success",
        checkpoint: checkpoint,
        timestamp: new Date(),
      });

      await syncGlobalStats();
    }
  } catch (err) {
    console.error(`Error processing minted agent ${anima_id}:`, err);
  }
}

export async function handleAgentActionExecuted(client: SuiClient, event: any) {
  const { anima_id, amount_swapped } = event.parsedJson;
  const txDigest = event.id.txDigest;
  const checkpoint = parseInt(event.checkpoint || "0");

  console.log(`[Action Event] Agent ID: ${anima_id}, Swapped: ${amount_swapped}`);

  let actionType = "SWAP";
  let targetProtocol = "DeepBook";

  try {
    const txBlock = await client.getTransactionBlock({
      digest: txDigest,
      options: { showInput: true },
    });

    const txCommands = txBlock.transaction?.data?.transaction?.transactions || [];
    for (const cmd of txCommands) {
      if (cmd.MoveCall) {
        const { module: mod, function: func } = cmd.MoveCall;
        if (mod === "wallet" && (func === "extract_funds_for_action" || func === "deposit_funds")) {
          actionType = "TRANSFER";
          targetProtocol = "Sui Network";
          break;
        }
      }
    }
  } catch (err) {
    console.error(`Error inspecting transaction block for action type:`, err);
  }

  try {
    // Insert action
    const { error } = await supabase.from("agent_actions").insert({
      agent_object_id: anima_id,
      tx_digest: txDigest,
      action_type: actionType,
      amount: parseInt(amount_swapped || "0"),
      from_token: "SUI",
      to_token: "SUI", // Or detail if it's token swaps
      target_protocol: targetProtocol,
      status: "success",
      checkpoint: checkpoint,
      timestamp: new Date(),
    });

    if (error) {
      console.error(`Error logging action for ${anima_id}:`, error);
    } else {
      console.log(`Logged ${actionType} action for ${anima_id} in Supabase`);
      // Update agent state and global stats
      await syncAgentState(client, anima_id);
      await syncGlobalStats();
    }
  } catch (err) {
    console.error(`Error processing action for agent ${anima_id}:`, err);
  }
}

export async function handleEmergencyHatch(client: SuiClient, event: any) {
  const { anima_id, guardian, recovered_amount } = event.parsedJson;
  const txDigest = event.id.txDigest;
  const checkpoint = parseInt(event.checkpoint || "0");

  console.log(`[Kill Switch Event] Agent ID: ${anima_id}, Recovered: ${recovered_amount}`);

  try {
    // Update agent state (paused)
    const { error: updateError } = await supabase
      .from("agents")
      .update({
        is_paused: true,
        wallet_balance: 0,
      })
      .eq("object_id", anima_id);

    if (updateError) {
      console.error(`Error pausing agent ${anima_id} on kill:`, updateError);
    }

    // Insert action
    await supabase.from("agent_actions").insert({
      agent_object_id: anima_id,
      tx_digest: txDigest,
      action_type: "KILL_SWITCH",
      amount: parseInt(recovered_amount || "0"),
      target_protocol: "AnimaProtocol",
      status: "success",
      checkpoint: checkpoint,
      timestamp: new Date(),
    });

    console.log(`Logged kill switch action for ${anima_id}`);
    await syncAgentState(client, anima_id);
    await syncGlobalStats();
  } catch (err) {
    console.error(`Error processing emergency kill for agent ${anima_id}:`, err);
  }
}

export async function handleComputeSettled(client: SuiClient, event: any) {
  const { anima_id, amount } = event.parsedJson;
  const txDigest = event.id.txDigest;
  const checkpoint = parseInt(event.checkpoint || "0");

  console.log(`[Compute Settled Event] Agent ID: ${anima_id}, Cost: ${amount}`);

  try {
    // Insert action
    await supabase.from("agent_actions").insert({
      agent_object_id: anima_id,
      tx_digest: txDigest,
      action_type: "COMPUTE",
      amount: parseInt(amount || "0"),
      target_protocol: "AnimaProtocol",
      status: "success",
      checkpoint: checkpoint,
      timestamp: new Date(),
    });

    console.log(`Logged compute settlement for ${anima_id}`);
    await syncAgentState(client, anima_id);
    await syncGlobalStats();
  } catch (err) {
    console.error(`Error processing compute settlement for agent ${anima_id}:`, err);
  }
}
