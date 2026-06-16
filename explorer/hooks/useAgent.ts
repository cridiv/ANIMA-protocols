import { useState, useEffect } from "react";
import { suiClient } from "../lib/sui";
import { supabase } from "../lib/supabase";
import { PACKAGE_ID } from "../lib/constants";

export interface SkillItem {
  name: string;
  walrusBlobId: string;
  description: string;
  version: string;
  riskLimits: {
    maxSpendPerAction: number;
    dailySpendCap: number;
  };
  triggerCondition: string;
  rawConfig?: any;
}

export interface AgentDetails {
  objectId: string;
  name: string;
  ownerAddress: string;
  ownerCapId: string;
  isPaused: boolean;
  reputationScore: number;
  walletBalance: number; // in SUI
  createdEpoch: number;
  skills: SkillItem[];
}

export function useAgent(agentId: string) {
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;

    let isMounted = true;

    async function fetchAgentData() {
      try {
        // 1. Fetch metadata from Supabase (fail-safe fallback)
        let dbAgent = null;
        try {
          const { data, error: dbError } = await supabase
            .from("agents")
            .select("*")
            .eq("object_id", agentId)
            .single();
          
          if (!dbError) {
            dbAgent = data;
          } else {
            console.warn("Supabase metadata fetch warning:", dbError.message);
          }
        } catch (dbErr) {
          console.warn("Supabase connection failed or is not configured yet:", dbErr);
        }

        // 2. Fetch live data from Sui RPC
        const response = await suiClient.getObject({
          id: agentId,
          options: { showContent: true },
        });

        if (response.error) {
          throw new Error(response.error.code || "Failed to fetch agent from Sui RPC");
        }

        if (!response.data || !response.data.content || response.data.content.dataType !== "moveObject") {
          throw new Error("Invalid agent object data on-chain");
        }

        const fields = response.data.content.fields as any;
        const liveName = fields.name;
        const liveIsPaused = fields.is_paused;
        const liveReputation = parseInt(fields.reputation_score || "0");
        const rawBalance = fields.wallet_balance;
        let liveBalanceMist = 0;
        if (typeof rawBalance === "string" || typeof rawBalance === "number") {
          liveBalanceMist = parseInt(rawBalance as any);
        } else if (rawBalance && rawBalance.fields && rawBalance.fields.value !== undefined) {
          liveBalanceMist = parseInt(rawBalance.fields.value);
        }
        const liveBalanceSui = liveBalanceMist / 1_000_000_000;

        // 3. Fetch skills dynamically from dynamic fields
        const skills: SkillItem[] = [];
        const dfResponse = await suiClient.getDynamicFields({ parentId: agentId });
        
        const skillFieldIds = dfResponse.data
          .filter((df) => df.name.type === `${PACKAGE_ID}::skill_registry::SkillKey`)
          .map((df) => df.objectId);

        if (skillFieldIds.length > 0) {
          const fieldObjects = await suiClient.multiGetObjects({
            ids: skillFieldIds,
            options: { showContent: true },
          });

          for (const obj of fieldObjects) {
            if (obj.data && obj.data.content && obj.data.content.dataType === "moveObject") {
              const fFields = obj.data.content.fields as any;
              const nameObj = fFields.name;
              const skillName = typeof nameObj === "string" 
                ? nameObj 
                : (nameObj.fields?.pos0 || nameObj.fields?.dummy_field || nameObj.fields?.name || nameObj.name || "unknown");
              const walrusBlobId = fFields.value;
              const finalBlobId = typeof walrusBlobId === "string" ? walrusBlobId.trim() : "";

              if (!finalBlobId || finalBlobId === "unavailable") {
                skills.push({
                  name: skillName,
                  walrusBlobId: "unavailable",
                  description: "Skill metadata not found or unavailable.",
                  version: "unknown",
                  riskLimits: {
                    maxSpendPerAction: 0,
                    dailySpendCap: 0,
                  },
                  triggerCondition: "Unavailable",
                  rawConfig: null,
                });
                continue;
              }

              try {
                const fetchUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${finalBlobId}`;
                const res = await fetch(fetchUrl);
                if (!res.ok) {
                  throw new Error(`Failed to fetch blob: ${res.statusText}`);
                }
                const data = await res.json();

                const maxSpend = data.execution_constraints?.max_spend_per_ptb_mist 
                  ? Number(data.execution_constraints.max_spend_per_ptb_mist) / 1_000_000_000 
                  : 0;
                const dailyCap = data.execution_constraints?.max_daily_loss_mist 
                  ? Number(data.execution_constraints.max_daily_loss_mist) / 1_000_000_000 
                  : 0;

                let triggerCondition = "Active";
                if (data.model_telemetry) {
                  const telemetry = data.model_telemetry;
                  if (telemetry.min_confidence_threshold !== undefined && data.data_sources?.price_feed) {
                    triggerCondition = `Confidence > ${telemetry.min_confidence_threshold}% via ${data.data_sources.price_feed}`;
                  } else if (telemetry.min_confidence_threshold !== undefined) {
                    triggerCondition = `Confidence > ${telemetry.min_confidence_threshold}%`;
                  }
                }

                skills.push({
                  name: data.skill_name || skillName,
                  walrusBlobId: finalBlobId,
                  description: data.description || "No description provided.",
                  version: data.version || "1.0.0",
                  riskLimits: {
                    maxSpendPerAction: maxSpend,
                    dailySpendCap: dailyCap,
                  },
                  triggerCondition: triggerCondition,
                  rawConfig: data,
                });
              } catch (fetchErr) {
                console.error(`Error fetching Walrus blob ${finalBlobId}:`, fetchErr);
                skills.push({
                  name: skillName,
                  walrusBlobId: finalBlobId,
                  description: "Skill metadata not found or unavailable.",
                  version: "unknown",
                  riskLimits: {
                    maxSpendPerAction: 0,
                    dailySpendCap: 0,
                  },
                  triggerCondition: "Unavailable",
                  rawConfig: null,
                });
              }
            }
          }
        }

        if (isMounted) {
          setAgent({
            objectId: agentId,
            name: liveName || dbAgent?.name || "Atlas V1",
            ownerAddress: dbAgent?.owner_address || "Pending Indexer Sync",
            ownerCapId: dbAgent?.owner_cap_id || "Pending Indexer Sync",
            isPaused: liveIsPaused,
            reputationScore: liveReputation,
            walletBalance: liveBalanceSui,
            createdEpoch: dbAgent?.minted_at_checkpoint ? Math.floor(dbAgent.minted_at_checkpoint / 100) : 1125,
            skills,
          });
          setLoading(false);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error loading agent details:", err);
        if (isMounted) {
          setError(err.message || "Failed to load agent details");
          setLoading(false);
        }
      }
    }

    fetchAgentData();

    // Poll every 10 seconds for live state sync
    const interval = setInterval(fetchAgentData, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [agentId]);

  return { agent, loading, error };
}
