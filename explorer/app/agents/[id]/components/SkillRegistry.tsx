"use client";

import React, { useState } from "react";
import {
  Cpu,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

interface SkillItem {
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

interface SkillRegistryProps {
  skills?: SkillItem[];
}

export default function SkillRegistry({
  skills = [
    {
      name: "token_price_monitor",
      walrusBlobId: "6a9f024e1388b76a084c8a213a708202",
      description:
        "Monitors SUI token price feeds off-chain and executes trades based on technical indicators.",
      version: "1.0.0",
      riskLimits: {
        maxSpendPerAction: 10.0,
        dailySpendCap: 50.0,
      },
      triggerCondition: "Price drops below $0.40 USD",
    },
    {
      name: "volatility_arbitrage",
      walrusBlobId: "4f7163003792c521f8d6a41a60ea7a1f",
      description:
        "Performs high-frequency cross-pool arbitrage swaps on DeepBook when price spread deviates.",
      version: "0.8.5",
      riskLimits: {
        maxSpendPerAction: 25.0,
        dailySpendCap: 150.0,
      },
      triggerCondition: "DeepBook Pool price spreads exceed 1.2%",
    },
  ],
}: SkillRegistryProps) {
  const [copiedBlobId, setCopiedBlobId] = useState<string | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(
    "token_price_monitor",
  );

  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlobId(name);
    setTimeout(() => setCopiedBlobId(null), 2000);
  };

  const toggleExpand = (name: string) => {
    setExpandedSkill(expandedSkill === name ? null : name);
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-6 text-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-background/10">
        <Cpu className="text-[#6fa0ff]" size={18} />
        <h2 className="text-base font-semibold text-background">
          Authorized Skill Registry
        </h2>
      </div>

      {skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
          <AlertCircle size={32} className="text-gray-600" />
          <p>No operational skills authorized on-chain.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {skills.map((skill) => {
            const isExpanded = expandedSkill === skill.name;
            const truncatedBlob = skill.walrusBlobId && skill.walrusBlobId !== "unavailable"
              ? `${skill.walrusBlobId.slice(0, 8)}...${skill.walrusBlobId.slice(-8)}`
              : "unavailable";

            return (
              <div
                key={skill.name}
                className="bg-background/5 rounded-xl border border-background/5 overflow-hidden transition-all duration-300"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(skill.name)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-background/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0241ff]/10 rounded-lg text-[#6fa0ff] border border-[#0241ff]/20">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-background font-mono text-xs">
                        {skill.name}
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Version {skill.version}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500 bg-background/5 px-2 py-1 rounded">
                      Walrus Blob
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-background/5 bg-black/10 flex flex-col gap-3.5 text-xs text-gray-300">
                    <p className="text-gray-400 leading-relaxed">
                      {skill.description}
                    </p>

                    {/* Walrus details */}
                    <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-lg border border-background/5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                          Walrus Storage Manifest
                        </span>
                        <span className="font-mono text-[11px] text-gray-300">
                          {truncatedBlob}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {skill.walrusBlobId && skill.walrusBlobId !== "unavailable" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(skill.walrusBlobId, skill.name);
                              }}
                              className="p-1.5 hover:text-background transition-colors hover:bg-background/5 rounded"
                              title="Copy Blob ID"
                            >
                              {copiedBlobId === skill.name ? (
                                <Check size={13} className="text-emerald-400" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                            <a
                              href={`https://walruscan.com/testnet/blob/${skill.walrusBlobId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:text-background transition-colors hover:bg-background/5 rounded flex items-center"
                              title="View on Walruscan"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metadata items */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background/[0.02] p-2.5 rounded-lg border border-background/5 flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-gray-500">
                          Trigger Condition
                        </span>
                        <span className="font-medium text-background">
                          {skill.triggerCondition}
                        </span>
                      </div>
                      <div className="bg-background/[0.02] p-2.5 rounded-lg border border-black/5 flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-wider text-gray-500">
                          Risk Controls
                        </span>
                        <div className="flex flex-col gap-0.5 font-mono text-[10px] text-background">
                          <div>
                            Max/Action: {skill.riskLimits.maxSpendPerAction} SUI
                          </div>
                          <div>
                            Daily Cap: {skill.riskLimits.dailySpendCap} SUI
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Raw JSON display */}
                    {skill.rawConfig && (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                          Raw Storage manifest parameters
                        </span>
                        <pre className="p-3 bg-black/40 rounded-lg border border-background/5 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-[200px] scrollbar-thin">
                          {JSON.stringify(skill.rawConfig, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
