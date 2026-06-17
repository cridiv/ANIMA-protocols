"use client";

import React, { useState } from "react";
import { Copy, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";

interface AgentHeaderProps {
  name?: string;
  objectId?: string;
  isPaused?: boolean;
}

export default function AgentHeader({
  name = "Atlas V1",
  objectId = "0x5f6681ebeff7b6a1a1f333ba20842d47ed822f39e3ca9d06de3a69f2282e6eca",
  isPaused = false,
}: AgentHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(objectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedId = `${objectId.slice(0, 8)}...${objectId.slice(-8)}`;

  return (
    <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl text-background font-bold tracking-tight">
            {name}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isPaused
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isPaused ? "bg-red-400" : "bg-emerald-400"
              }`}
            />
            {isPaused ? "PAUSED" : "ACTIVE"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-mono text-xs">{truncatedId}</span>
          <button
            onClick={handleCopy}
            className="p-1 hover:text-background transition-colors cursor-pointer"
            title="Copy Object ID"
          >
            <Copy size={14} className={copied ? "text-emerald-400" : ""} />
          </button>
          <a
            href={`https://suiexplorer.com/object/${objectId}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:text-background transition-colors flex items-center gap-0.5"
            title="View on Sui Explorer"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
        {isPaused ? (
          <>
            <ShieldAlert className="text-red-400" size={24} />
            <div className="text-xs">
              <p className="font-semibold text-background">Emergency Paused</p>
              <p className="text-gray-400">
                Autonomous loop halted by guardian
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldCheck
              className="text-emerald-400 animate-spin-slow"
              size={24}
            />
            <div className="text-xs">
              <p className="font-semibold text-background">Secured Sandbox</p>
              <p className="text-gray-400">Guardian cap monitoring active</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
