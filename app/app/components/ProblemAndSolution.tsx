"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  EyeOff,
  Database,
  ShieldCheck,
  CheckCircle2,
  Network,
  Info,
  ArrowRight,
} from "lucide-react";

export default function ProblemAndSolution() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const problems = [
    {
      icon: <ShieldAlert className="w-6 h-6 text-[#0241ff]" />,
      title: "The 'Shadow Wallet' Vulnerability",
      desc: "Because a traditional address is just a private key file sitting on a server, there is no structural boundary. The AI agent has all the authority or none of it. If its off-chain runtime is compromised, or its code encounters a mathematical edge-case loop, it can drain the entire wallet balance instantly.",
    },
    {
      icon: <EyeOff className="w-6 h-6 text-[#0241ff]" />,
      title: "Total Opaqueness",
      desc: "When a DeFi protocol or a DAO sees a transaction originating from a random key, they have no way of knowing if that signature came from a human typing on a laptop, a simple 10-line cron-job liquidation bot, or a highly sophisticated machine-learning model executing a rebalancing strategy.",
    },
    {
      icon: <Database className="w-6 h-6 text-[#0241ff]" />,
      title: "Zero Persistent Auditing",
      desc: "Traditional addresses don't have 'memory' outside of raw transaction hashes. You cannot query a wallet address directly to see what model version it is running, what data boundaries it is constrained by, or what skills it has been authorized to use.",
    },
  ];

  const solutions = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0241ff]" />,
      title: "Programmatic Guardianship vs. Absolute Control",
      desc: "The human holds an immutable OwnerCap object. The NFA contains the actual wallet balance. If the agent behaves erratically or gets hacked, the human uses the OwnerCap to flip the state variable to is_paused and extracts the remaining funds. The base Sui runtime has no native concept of an asymmetric human-to-machine kill switch—ANIMA builds it.",
    },
    {
      icon: <Network className="w-6 h-6 text-[#0241ff]" />,
      title: "Content-Addressed Accountability (Walrus)",
      desc: "An NFA utilizes Sui’s dynamic fields to map explicit operational 'Skills' directly to Walrus Blob IDs. This means the agent's core code strategy, risk thresholds, and model weights are cryptographically anchored to its on-chain identity. Anyone can pull its blueprint from Walrus and verify permissions before routing capital through it.",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-[#0241ff]" />,
      title: "Atomic Attribution via PTBs",
      desc: "Because ANIMA utilizes Programmable Transaction Blocks (PTBs), it wraps the identity check, execution logic, and custom tracking event emission into a single atomic lifecycle. The accountability trail isn't a byproduct of the trade; it is bound to the trade itself. If the agent does not log its actions against its NFA identity, the transaction physically cannot settle.",
    },
  ];

  const tableData = [
    {
      criteria: "Security Model",
      suiAddress:
        "Uses a private key file; anyone with the file can steal all funds permanently.",
      nfa: "Acts via a sovereign object; protected by code boundaries and an emergency OwnerCap.",
    },
    {
      criteria: "On-chain Visibility",
      suiAddress:
        "Protocols see a random hex address; zero trust or performance metrics are visible.",
      nfa: "Protocols see an active NFA with a verifiable reputation score and skill manifest.",
    },
    {
      criteria: "Configuration Audit",
      suiAddress:
        "Configuration parameters live on a private AWS database; un-auditable by the public.",
      nfa: "Configuration and rules live verifiably on Walrus, cryptographically pinned to the object.",
    },
  ];

  return (
    <section className="w-full bg-[#f8f8f8] text-[#171717] relative z-10 border-t border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-24">
        {/* SECTION 1: THE PROBLEM */}
        <div className="mb-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-px bg-red-500"></div>
            <span className="inline-flex items-center text-xs font-semibold text-red-500 uppercase tracking-wider">
              The Problem
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-tight">
                The Blockchain Thinks Agents are Humans
              </h2>
            </div>
            <div className="lg:col-span-6 flex items-center">
              <p className="text-zinc-500 text-sm md:text-base font-light leading-relaxed">
                The base layer of Sui (and every other L1 network) operates on a
                binary model: you are either an{" "}
                <strong>Address (Ed25519 public key)</strong> or a{" "}
                <strong>Smart Contract Package</strong>. When an AI agent runs,
                it does so by holding the private key to a standard address,
                creating fatal architectural friction points.
              </p>
            </div>
          </div>

          {/* Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((prob, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:border-red-200 hover:shadow-md transition-all flex flex-col gap-4"
              >
                <div className="p-3 bg-red-50/50 rounded-xl w-fit border border-red-100/30">
                  {prob.icon}
                </div>
                <h3 className="text-lg font-medium tracking-tight text-zinc-900">
                  {prob.title}
                </h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">
                  {prob.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: THE SOLUTION */}
      <div className="w-full secondary-bg text-white py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-px bg-blue-300"></div>
            <span className="inline-flex items-center text-xs font-semibold text-blue-200 uppercase tracking-wider">
              The Solution
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-tight text-white">
                What ANIMA Gives Sui That It Doesn't Natively Have
              </h2>
            </div>
            <div className="lg:col-span-6 flex items-center">
              <p className="text-blue-100 text-sm md:text-base font-light leading-relaxed">
                By packaging the agent as a{" "}
                <strong className="text-white font-medium">
                  Non-Fungible Agent (NFA)
                </strong>
                —a native Sui Object—we transform the agent from a raw account
                credential into a first-class on-chain economic citizen.
              </p>
            </div>
          </div>

          {/* Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solutions.map((sol, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex flex-col gap-4"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.05] rounded-full blur-xl" />
                <div className="p-3 bg-blue-50/10 rounded-xl w-fit border border-blue-100/30">
                  {React.cloneElement(sol.icon, {
                    className: "w-6 h-6 text-blue-500",
                  })}
                </div>
                <h3 className="text-lg font-medium tracking-tight text-zinc-900">
                  {sol.title}
                </h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">
                  {sol.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-24 pb-0">
        {/* SECTION 3: THE STRUCTURAL CONTRAST */}
        <div className="mb-24">
          <div className="text-center max-w-[600px] mx-auto mb-10">
            <h3 className="text-2xl md:text-3xl font-normal tracking-tight mb-3">
              The Structural Contrast
            </h3>
            <p className="text-zinc-500 text-sm md:text-base font-light">
              A detailed architectural comparison of standard script execution
              vs. sovereign ANIMA integration.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="border border-zinc-200 bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6 font-medium">
                      Comparison Criteria
                    </th>
                    <th className="py-4 px-6 font-medium">
                      Regular Sui Address
                    </th>
                    <th className="py-4 px-6 font-medium text-[#0241ff]">
                      ANIMA NFA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr
                      key={idx}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-zinc-100 last:border-0 transition-colors ${
                        hoveredRow === idx ? "bg-zinc-50/50" : ""
                      }`}
                    >
                      <td className="py-5 px-6 font-medium text-sm text-zinc-900 max-w-[180px]">
                        {row.criteria}
                      </td>
                      <td className="py-5 px-6 text-sm text-zinc-500 font-light max-w-[400px] leading-relaxed">
                        {row.suiAddress}
                      </td>
                      <td className="py-5 px-6 text-sm text-zinc-700 font-medium max-w-[400px] leading-relaxed bg-blue-500/[0.01]">
                        <span className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-[#0241ff] shrink-0 mt-0.5" />
                          <span>{row.nfa}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* SECTION 4: DEMO DAY PITCH QUOTE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-blue-100 bg-blue-50/15 p-8 md:p-12 text-center overflow-hidden max-w-4xl mx-auto"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#0241ff]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-[#0241ff] border border-blue-500/15 uppercase tracking-wider font-mono">
              Key Note Focus
            </span>
            <blockquote className="text-xl md:text-2xl font-light text-zinc-800 leading-relaxed italic">
              &ldquo;Traditional blockchains are built to protect humans from
              other humans. But the future of the web belongs to machines.{" "}
              <strong>
                ANIMA does not change how Sui processes transactions—it changes
                how Sui understands autonomous actors.
              </strong>{" "}
              It turns a faceless bot into a responsible, auditable, and secure
              digital economic citizen.&rdquo;
            </blockquote>
            <div className="flex items-center gap-2 text-zinc-400 text-xs tracking-wider uppercase font-semibold">
              <Info className="w-4 h-4 text-[#0241ff]" />
              Demo Day Technical Takeaway
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
