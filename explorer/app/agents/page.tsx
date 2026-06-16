"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Grainient from "@/app/components/animations/Grainient";
import { supabase } from "@/lib/supabase";
import {
  Cpu,
  ExternalLink,
  Activity,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ShieldAlert,
  Coins,
  BadgePlus,
  ArrowDownLeft,
} from "lucide-react";

interface TransactionItem {
  id: string;
  agentObjectId: string;
  agentName: string;
  actionType: string;
  amount: string;
  fromToken?: string;
  toToken?: string;
  targetProtocol?: string;
  status: string;
  txDigest: string;
  timestamp: number;
  isAgentPaused: boolean;
}

export default function AgentsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchTransactions() {
      try {
        const { data, error } = await supabase
          .from("agent_actions")
          .select(`
            *,
            agents (
              name,
              is_paused
            )
          `)
          .order("timestamp", { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data && isMounted) {
          const formattedTx: TransactionItem[] = data.map((item: any) => ({
            id: item.id,
            agentObjectId: item.agent_object_id,
            agentName: item.agents?.name || "Unknown Agent",
            actionType: item.action_type,
            amount: item.amount ? item.amount.toString() : "0",
            fromToken: item.from_token,
            toToken: item.to_token,
            targetProtocol: item.target_protocol,
            status: item.status || "success",
            txDigest: item.tx_digest,
            timestamp: new Date(item.timestamp).getTime(),
            isAgentPaused: !!item.agents?.is_paused,
          }));
          setTransactions(formattedTx);
        }
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "SWAP":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "TRANSFER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "COMPUTE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "MINT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "KILL_SWITCH":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "SWAP":
        return <ArrowRight size={12} />;
      case "TRANSFER":
        return <ArrowDownLeft size={12} />;
      case "COMPUTE":
        return <Cpu size={12} />;
      case "MINT":
        return <BadgePlus size={12} />;
      case "KILL_SWITCH":
        return <ShieldAlert size={12} />;
      default:
        return <ArrowRight size={12} />;
    }
  };

  const formatAmount = (mistStr: string) => {
    const mist = parseFloat(mistStr);
    if (isNaN(mist) || mist === 0) return "-";
    const sui = mist / 1_000_000_000;
    return `${sui.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} SUI`;
  };

  const truncateId = (id: string) => `${id.slice(0, 8)}...${id.slice(-8)}`;

  const formatTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-accent text-white overflow-hidden">
      {/* Background anim */}
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-[calc(100%-1rem)] bg-foreground rounded-tl-3xl rounded-tr-3xl max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-4 border-b border-white/10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black flex items-center gap-2">
                <Activity className="text-[#6fa0ff]" /> Global Network Ledger
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Showing historical transaction execution logs for all AI agents (NFAs) on the Sui protocol ledger.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs flex items-center gap-2 w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-gray-500">
                Live Ledger Feeds Syncing
              </span>
            </div>
          </div>

          {/* Table Listing */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                    <th className="py-4 px-6 w-[15%]">Type</th>
                    <th className="py-4 px-6 w-[25%]">Agent Identity</th>
                    <th className="py-4 px-6 w-[20%]">Value</th>
                    <th className="py-4 px-6 w-[25%]">Description</th>
                    <th className="py-4 px-6 w-[15%]">Time</th>
                    <th className="py-4 px-6 text-right w-[15%]">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Loading transaction history...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No transactions recorded on-chain yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                      >
                        {/* Transaction Type */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${getBadgeColor(
                              tx.actionType,
                            )}`}
                          >
                            {getActionIcon(tx.actionType)}
                            {tx.actionType}
                          </span>
                        </td>

                        {/* Agent Address / Name */}
                        <td className="py-4 px-6 font-mono">
                          <div className="flex items-center gap-2">
                            <Cpu size={13} className="text-[#6fa0ff] shrink-0" />
                            <div className="flex flex-col">
                              <Link
                                href={`/agents/${tx.agentObjectId}`}
                                className="font-bold text-black hover:text-[#6fa0ff] hover:underline transition-colors cursor-pointer"
                              >
                                {tx.agentName}
                              </Link>
                              <span className="text-[10px] text-gray-500 font-sans font-semibold mt-0.5 flex items-center gap-1">
                                ID: {truncateId(tx.agentObjectId)}
                                {tx.isAgentPaused && (
                                  <span className="text-red-400 font-bold text-[9px] bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                                    PAUSED
                                  </span>
                                )}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleCopy(e, tx.agentObjectId)}
                              className="p-1 hover:text-black transition-colors cursor-pointer text-gray-500 hover:bg-white/5 rounded"
                              title="Copy Address"
                            >
                              {copiedId === tx.agentObjectId ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Value */}
                        <td className="py-4 px-6 font-mono font-medium text-black">
                          {tx.actionType !== "MINT" && tx.actionType !== "KILL_SWITCH"
                            ? formatAmount(tx.amount)
                            : "-"}
                        </td>

                        {/* Action details */}
                        <td className="py-4 px-6 text-gray-400 text-xs font-semibold">
                          {tx.actionType === "SWAP" && (
                            <span>Swap on {tx.targetProtocol || "DeepBook"}</span>
                          )}
                          {tx.actionType === "COMPUTE" && (
                            <span>Compute settlement fee</span>
                          )}
                          {tx.actionType === "MINT" && (
                            <span>Agent Instantiation</span>
                          )}
                          {tx.actionType === "KILL_SWITCH" && (
                            <span className="text-red-400">Emergency hatch triggered</span>
                          )}
                          {tx.actionType !== "SWAP" &&
                            tx.actionType !== "COMPUTE" &&
                            tx.actionType !== "MINT" &&
                            tx.actionType !== "KILL_SWITCH" && (
                              <span>{tx.targetProtocol || "System Action"}</span>
                            )}
                        </td>

                        {/* Time */}
                        <td className="py-4 px-6 text-gray-500 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatTime(tx.timestamp)}
                          </div>
                        </td>

                        {/* Transaction Digest */}
                        <td className="py-4 px-6 text-right">
                          {tx.txDigest && tx.txDigest !== "unknown" ? (
                            <a
                              href={`https://suiexplorer.com/txblock/${tx.txDigest}?network=testnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-mono text-[#6fa0ff] hover:text-black hover:underline cursor-pointer"
                            >
                              {tx.txDigest.slice(0, 6)}...
                              {tx.txDigest.slice(-6)}
                              <ExternalLink size={11} className="opacity-50" />
                            </a>
                          ) : (
                            <span className="text-gray-600 font-mono text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
