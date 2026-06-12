"use client";

import React from "react";
import {
  History,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Cpu,
  ShieldAlert,
  BadgePlus,
} from "lucide-react";

interface ActionItem {
  agentId: string;
  actionType: string;
  amount: string;
  timestamp: number;
  txDigest: string;
}

interface ActionFeedProps {
  actions?: ActionItem[];
  isPolling?: boolean;
}

export default function ActionFeed({
  actions = [
    {
      agentId:
        "0x63b6429339342dd64edd48c56420983c1dd37b4d8e573123e051a4cf52a092a1",
      actionType: "SWAP",
      amount: "15500000000", // in MIST
      timestamp: Date.now() - 120000, // 2 minutes ago
      txDigest: "9yH8W3c8R1z2A7b3c6d4e5f6g7h8i9j0k1l2m3n4o5p",
    },
    {
      agentId:
        "0x63b6429339342dd64edd48c56420983c1dd37b4d8e573123e051a4cf52a092a1",
      actionType: "COMPUTE",
      amount: "500000000", // in MIST
      timestamp: Date.now() - 3600000, // 1 hour ago
      txDigest: "3aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef",
    },
    {
      agentId:
        "0x63b6429339342dd64edd48c56420983c1dd37b4d8e573123e051a4cf52a092a1",
      actionType: "MINT",
      amount: "0",
      timestamp: Date.now() - 86400000, // 1 day ago
      txDigest: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v",
    },
  ],
  isPolling = true,
}: ActionFeedProps) {
  const formatAmount = (mistStr: string) => {
    const mist = parseFloat(mistStr);
    if (isNaN(mist) || mist === 0) return "-";
    const sui = mist / 1_000_000_000;
    return `${sui.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} SUI`;
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
        return <ArrowRight size={14} />;
      case "COMPUTE":
        return <Cpu size={14} />;
      case "MINT":
        return <BadgePlus size={14} />;
      case "KILL_SWITCH":
        return <ShieldAlert size={14} />;
      default:
        return <ArrowRight size={14} />;
    }
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-6 text-sm">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <History className="text-[#6fa0ff]" size={18} />
          <h2 className="text-base font-semibold text-background">
            Live Action Ledger
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {isPolling && (
            <RefreshCw size={12} className="animate-spin text-gray-400" />
          )}
          Live polling
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
          <History size={32} className="text-gray-600" />
          <p>No actions logged yet. Monitoring price ticks...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider pb-3">
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Timestamp</th>
                <th className="py-3 px-2 text-right">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action, idx) => (
                <tr
                  key={action.txDigest + idx}
                  className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                >
                  <td className="py-4 px-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(
                        action.actionType,
                      )}`}
                    >
                      {getActionIcon(action.actionType)}
                      {action.actionType}
                    </span>
                  </td>
                  <td className="py-4 px-2 font-mono font-medium text-background">
                    {formatAmount(action.amount)}
                  </td>
                  <td className="py-4 px-2 text-gray-400 text-xs">
                    {formatTime(action.timestamp)}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <a
                      href={`https://suiexplorer.com/txblock/${action.txDigest}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#6fa0ff] hover:text-background hover:underline transition-colors cursor-pointer"
                    >
                      {action.txDigest.slice(0, 6)}...
                      {action.txDigest.slice(-6)}
                      <ExternalLink
                        size={12}
                        className="opacity-50 group-hover:opacity-100"
                      />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
