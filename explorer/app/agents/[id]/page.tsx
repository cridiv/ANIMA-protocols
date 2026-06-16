"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Grainient from "@/app/components/animations/Grainient";
import { Wallet, Shield, Cpu, History, ShieldAlert } from "lucide-react";
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/constants";
import { useAgent } from "@/hooks/useAgent";
import { useAgentActions } from "@/hooks/useAgentActions";

// Import structured widgets
import AgentHeader from "./components/AgentHeader";
import IdentityPanel from "./components/IdentityPanel";
import WalletPanel from "./components/WalletPanel";
import SkillRegistry from "./components/SkillRegistry";
import ActionFeed from "./components/ActionFeed";
import KillSwitch from "./components/KillSwitch";

type TabType = "overview" | "skills" | "activity" | "emergency";

export default function AgentProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [hasOwnerCap, setHasOwnerCap] = useState(false);
  const [ownerCapObjectId, setOwnerCapObjectId] = useState<string | null>(null);
  const [isExecutingKill, setIsExecutingKill] = useState(false);

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Load live agent data from Sui RPC + Supabase
  const { agent, loading, error } = useAgent(id);
  // Load actions log
  const { actions, loading: loadingActions } = useAgentActions(id);

  // Check if connected wallet owns the OwnerCap for this agent
  useEffect(() => {
    if (!currentAccount || !agent) {
      setHasOwnerCap(false);
      setOwnerCapObjectId(null);
      return;
    }

    async function checkOwnerCap() {
      try {
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount!.address,
          filter: {
            StructType: `${PACKAGE_ID}::protocol::OwnerCap`,
          },
          options: {
            showContent: true,
          },
        });

        let foundCapId: string | null = null;
        const ownsCap = ownedObjects.data.some((obj) => {
          const fields = (obj.data?.content as any)?.fields;
          if (fields && fields.anima_id === agent?.objectId) {
            foundCapId = obj.data!.objectId;
            return true;
          }
          return false;
        });

        setHasOwnerCap(ownsCap);
        setOwnerCapObjectId(foundCapId);
      } catch (err) {
        console.error("Error querying owned OwnerCap:", err);
        // Fallback to address matching
        const ownsByAddress = currentAccount!.address === agent?.ownerAddress;
        setHasOwnerCap(ownsByAddress);
        setOwnerCapObjectId(ownsByAddress ? agent?.ownerCapId : null);
      }
    }

    checkOwnerCap();
  }, [currentAccount, agent, suiClient]);

  const handleConfirmKill = async () => {
    if (!agent) return;
    
    // Resolve capability ID
    const capId = ownerCapObjectId || agent.ownerCapId;
    if (!capId) {
      throw new Error("Missing OwnerCap object ID. Make sure it is indexed in Supabase or held in your wallet.");
    }

    setIsExecutingKill(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::protocol::trigger_emergency_kill`,
        arguments: [
          tx.object(agent.objectId),
          tx.object(capId),
        ],
      });

      const response = await signAndExecuteTransaction({ transaction: tx });
      await suiClient.waitForTransaction({ digest: response.digest });
    } catch (err: any) {
      console.error("Kill switch failed:", err);
      throw new Error(err.message || "Failed to trigger emergency kill switch.");
    } finally {
      setIsExecutingKill(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Syncing Agent Ledger...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-accent text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-background">Agent Not Found</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            We couldn't retrieve the specified ANIMA agent object {id} from the Sui Testnet blockchain or our database.
          </p>
          <Link href="/agents" className="mt-6">
            <button className="primary-button px-5 py-2.5 rounded-full text-xs font-semibold text-white cursor-pointer">
              Back to Agents
            </button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Sum volume from SWAP/TRANSFER actions
  const totalVolumeSui = actions.reduce((acc, act) => {
    const isVolumeType = act.actionType === "SWAP" || act.actionType === "TRANSFER";
    return acc + (isVolumeType ? parseFloat(act.amount) / 1_000_000_000 : 0);
  }, 0);

  return (
    <div className="relative min-h-screen flex flex-col bg-accent text-white overflow-hidden">
      {/* Dynamic Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#0241ff"
          color2="#000000"
          color3="#6fa0ff"
          timeSpeed={0.15}
          colorBalance={-0.2}
          warpStrength={0.8}
          warpFrequency={4}
          warpSpeed={1.5}
          warpAmplitude={40}
          blendAngle={45}
          blendSoftness={0.7}
          rotationAmount={300}
          noiseScale={2}
          grainAmount={0.08}
          grainScale={1.5}
          grainAnimated={false}
          contrast={2.2}
          gamma={1}
          saturation={0.9}
          centerX={0}
          centerY={0}
          zoom={0.85}
        />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-[calc(100%-1rem)] bg-foreground rounded-tl-3xl rounded-tr-3xl max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Header block: Name, status, ID */}
          <AgentHeader
            objectId={agent.objectId}
            name={agent.name}
            isPaused={agent.isPaused}
          />

          {/* Navigation Tabs Bar */}
          <div className="flex border-b border-white/10 gap-x-1 sm:gap-x-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "overview"
                  ? "text-background border-[#0241ff] bg-white/5"
                  : "text-gray-400 border-transparent hover:text-background hover:bg-white/[0.02]"
              }`}
            >
              <Wallet size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "skills"
                  ? "text-background border-[#0241ff] bg-white/5"
                  : "text-gray-400 border-transparent hover:text-background hover:bg-white/[0.02]"
              }`}
            >
              <Cpu size={16} />
              Skills Registry
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "activity"
                  ? "text-background border-[#0241ff] bg-white/5"
                  : "text-gray-400 border-transparent hover:text-background hover:bg-white/[0.02]"
              }`}
            >
              <History size={16} />
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "emergency"
                  ? "text-red-400 border-red-500 bg-red-500/5"
                  : "text-gray-400 border-transparent hover:text-red-400 hover:bg-white/[0.02]"
              }`}
            >
              <ShieldAlert size={16} />
              Emergency Controls
            </button>
          </div>

          {/* Conditional Tab Rendering */}
          <div className="w-full transition-opacity duration-300">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-fadeIn">
                <WalletPanel agentObjectId={agent.objectId} balanceSui={agent.walletBalance} totalVolumeSui={totalVolumeSui} />
                <IdentityPanel
                  ownerAddress={agent.ownerAddress}
                  ownerCapId={agent.ownerCapId}
                  backendCapId={agent.objectId}
                  reputationScore={agent.reputationScore}
                  createdEpoch={agent.createdEpoch}
                />
              </div>
            )}

            {activeTab === "skills" && (
              <div className="w-full animate-fadeIn">
                <SkillRegistry skills={agent.skills} />
              </div>
            )}

            {activeTab === "activity" && (
              <div className="w-full animate-fadeIn">
                <ActionFeed actions={actions} />
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="max-w-2xl mx-auto w-full animate-fadeIn">
                <KillSwitch
                  hasOwnerCap={hasOwnerCap}
                  onConfirmKill={handleConfirmKill}
                  isExecuting={isExecutingKill}
                  isPaused={agent.isPaused}
                />
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
