"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Grainient from "@/app/components/animations/Grainient";
import {
  Cpu,
  ExternalLink,
  Activity,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface ActionItem {
  actionType: string;
  amount: string;
  timestamp: number;
  txDigest: string;
}

interface AgentItem {
  objectId: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  reputation: number;
  lastAction: ActionItem;
}

const MOCK_AGENTS: AgentItem[] = [
  {
    objectId:
      "0xaf79d9aaf7fd188a4f7163003792c521f8d6a41a60ea7a1f360aebcec7006bdb",
    name: "Atlas V1",
    status: "ACTIVE",
    reputation: 142,
    lastAction: {
      actionType: "SWAP",
      amount: "15500000000",
      timestamp: Date.now() - 120000,
      txDigest: "9yH8W3c8R1z2A7b3c6d4e5f6g7h8i9j0k1l2m3n4o5p",
    },
  },
  {
    objectId:
      "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    name: "Aegis",
    status: "ACTIVE",
    reputation: 118,
    lastAction: {
      actionType: "SWAP",
      amount: "25000000000",
      timestamp: Date.now() - 180000,
      txDigest: "z9x8y7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e",
    },
  },
  {
    objectId:
      "0x5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k",
    name: "Chronos",
    status: "PAUSED",
    reputation: 92,
    lastAction: {
      actionType: "KILL_SWITCH",
      amount: "34000000000",
      timestamp: Date.now() - 14400000,
      txDigest: "k1j2i3h4g5f6e7d8c9b0a1z2y3x4w5v6u7t8s9r0q1p",
    },
  },
  {
    objectId:
      "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    name: "Elysium",
    status: "ACTIVE",
    reputation: 156,
    lastAction: {
      actionType: "COMPUTE",
      amount: "80000000",
      timestamp: Date.now() - 900000,
      txDigest: "q8w7e6r5t4y3u2i1o0p9a8s7d6f5g4h3j2k1l0z9x8c",
    },
  },
  {
    objectId:
      "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    name: "Hesperia",
    status: "ACTIVE",
    reputation: 104,
    lastAction: {
      actionType: "SWAP",
      amount: "12000000000",
      timestamp: Date.now() - 10800000,
      txDigest: "m9n8b7v6c5x4z3l2k1j0h9g8f7d6s5a4p3o2i1u0y9t",
    },
  },
  {
    objectId:
      "0x1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g",
    name: "Prometheus",
    status: "ACTIVE",
    reputation: 112,
    lastAction: {
      actionType: "COMPUTE",
      amount: "40000000",
      timestamp: Date.now() - 18000000,
      txDigest: "y1x2w3v4u5t6s7r8q9p0o1n2m3l4k5j6i7h8g9f0e1d",
    },
  },
  {
    objectId:
      "0x3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i",
    name: "Zephyr",
    status: "ACTIVE",
    reputation: 124,
    lastAction: {
      actionType: "SWAP",
      amount: "8500000000",
      timestamp: Date.now() - 21600000,
      txDigest: "h9g8f7e6d5c4b3a2z1y0x9w8v7u6t5s4r3q2p1o0n9m",
    },
  },
  {
    objectId:
      "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    name: "Valkyrie",
    status: "ACTIVE",
    reputation: 138,
    lastAction: {
      actionType: "SWAP",
      amount: "32000000000",
      timestamp: Date.now() - 3600000,
      txDigest: "j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e",
    },
  },
  {
    objectId:
      "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    name: "Hyperion",
    status: "ACTIVE",
    reputation: 147,
    lastAction: {
      actionType: "TRANSFER",
      amount: "150000000000",
      timestamp: Date.now() - 43200000,
      txDigest: "u9i8o7p6l5k4j3h2g1f0d9s8a7q6w5e4r3t2y1u0i9o",
    },
  },
  {
    objectId:
      "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    name: "Nemesis",
    status: "PAUSED",
    reputation: 80,
    lastAction: {
      actionType: "KILL_SWITCH",
      amount: "4200000000",
      timestamp: Date.now() - 86400000,
      txDigest: "x9c8v7b6n5m4k3j2h1g0f9d8s7a6q5w4e3r2t1y0u9i",
    },
  },
];

export default function AgentsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateId = (id: string) => `${id.slice(0, 8)}...${id.slice(-8)}`;

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

  const formatAmount = (mistStr: string) => {
    const mist = parseFloat(mistStr);
    if (isNaN(mist) || mist === 0) return "-";
    const sui = mist / 1_000_000_000;
    return `${sui.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} SUI`;
  };

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
                <Activity className="text-[#6fa0ff]" /> Active Network Agents
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Showing the 10 most recently active AI agents (NFAs) on the Sui
                protocol ledger.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs flex items-center gap-2 w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-gray-500">
                Live Agent Feeds Syncing
              </span>
            </div>
          </div>

          {/* Table Listing */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                    <th className="py-4 px-6 w-1/2">Agent Address</th>
                    <th className="py-4 px-6 w-1/2">
                      Most Recent Activity Log
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AGENTS.map((agent) => (
                    <tr
                      key={agent.objectId}
                      className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                    >
                      {/* Agent Address */}
                      <td className="py-4 px-6 font-mono">
                        <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-[#6fa0ff] shrink-0" />
                          <Link
                            href={`/agents/${agent.objectId}`}
                            className="font-bold text-black hover:text-[#6fa0ff] hover:underline transition-colors cursor-pointer"
                          >
                            {agent.objectId}
                          </Link>
                          <button
                            onClick={(e) => handleCopy(e, agent.objectId)}
                            className="p-1 hover:text-black transition-colors cursor-pointer text-gray-500 hover:bg-white/5 rounded"
                            title="Copy Address"
                          >
                            {copiedId === agent.objectId ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Most Recent Log (badge, amount, time, tx) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-300">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${getBadgeColor(
                              agent.lastAction.actionType,
                            )}`}
                          >
                            {agent.lastAction.actionType}
                          </span>
                          {agent.lastAction.actionType !== "MINT" &&
                            agent.lastAction.actionType !== "KILL_SWITCH" && (
                              <span className="font-mono font-medium text-black">
                                {formatAmount(agent.lastAction.amount)}
                              </span>
                            )}
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock size={11} />
                            {formatTime(agent.lastAction.timestamp)}
                          </span>
                          <span className="text-gray-500">|</span>
                          <a
                            href={`https://suiexplorer.com/txblock/${agent.lastAction.txDigest}?network=testnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-mono text-[#6fa0ff] hover:text-black hover:underline cursor-pointer"
                          >
                            Tx: {agent.lastAction.txDigest.slice(0, 6)}...
                            {agent.lastAction.txDigest.slice(-6)}
                            <ExternalLink size={11} className="opacity-50" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
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
