"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Shield,
  Wallet,
  BookOpen,
  Layers,
  RefreshCw,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import Aurora from "./animations/Aurora";

// Types for the comparison cognitive model
interface ComparisonDimension {
  id: string;
  title: string;
  icon: React.ReactNode;
  nftText: string;
  nftHighlight: string;
  nfaText: string;
  nfaHighlight: string;
}

export default function IntroducingNFA() {
  const [activeDimension, setActiveDimension] = useState<string>("identity");

  const dimensions: ComparisonDimension[] = [
    {
      id: "identity",
      title: "Core Identity",
      icon: <Layers className="w-5 h-5" />,
      nftText:
        "Points to static metadata, images, or media files stored in IPFS or web2 URLs.",
      nftHighlight: "Static Reference Pointer",
      nfaText:
        "Represents a live on-chain agent. Binds a custom name, reputation score, and active operational state.",
      nfaHighlight: "Dynamic Sovereign Identity",
    },
    {
      id: "assets",
      title: "Asset Sovereign Vault",
      icon: <Wallet className="w-5 h-5" />,
      nftText:
        "Is itself an asset owned by a human wallet. Cannot hold or manage external tokens.",
      nftHighlight: "Owned Passive Asset",
      nfaText:
        "Encapsulates a sovereign inner balance pool. Can receive, hold, and deploy SUI and whitelisted tokens autonomously.",
      nfaHighlight: "Self-Sovereign Capital Vault",
    },
    {
      id: "logic",
      title: "Behavior & Logic",
      icon: <Cpu className="w-5 h-5" />,
      nftText:
        "No execution capabilities. Rely completely on external smart contracts or wallets to move them.",
      nftHighlight: "Zero Autonomous Logic",
      nfaText:
        "Hooks into a decentralized Skill Registry holding Walrus Blob IDs with dynamic, modular code structures.",
      nfaHighlight: "Extensible Skill Architecture",
    },
    {
      id: "actions",
      title: "Execution Model",
      icon: <KeyRound className="w-5 h-5" />,
      nftText:
        "Cannot initiate transactions. Operations are limited to standard manual transfers or listings.",
      nftHighlight: "Manual Interactions Only",
      nfaText:
        "Binds an off-chain Hot-Wallet operator address, executing transaction blocks via cryptographic delegation.",
      nfaHighlight: "Delegated Hot-Wallet Execution",
    },
  ];

  const currentDimension =
    dimensions.find((d) => d.id === activeDimension) || dimensions[0];

  return (
    <section className="w-full py-20 px-4 md:px-8 bg-[#f8f8f8] text-[#171717] relative z-10 border-t border-zinc-200">
      <div className="max-w-[1200px] mx-auto">
        {/* Intro Grid: Split 50/50 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left: Headline & Inspo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-px bg-[#0241ff]"></div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#0241ff] w-fit uppercase tracking-wider">
                Introducing NFA{`s`}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal leading-tight tracking-tight">
              Giving AI Agents a Soul on Sui
            </h2>
            <p className="text-[#4c4c4c] text-base md:text-lg leading-relaxed font-light">
              ANIMA is a native agent identity and autonomy protocol built on
              Sui. It allows humans to mint AI agents as{" "}
              <b>Non-Fungible Agents (NFAs)</b> - unique on-chain objects with
              their own sovereign wallet, skill registry, and immutable action
              history.
            </p>
            <p className="text-[#4c4c4c] text-base md:text-lg leading-relaxed font-light">
              Agents reason and act off-chain, but every economic decision they
              execute is logged on-chain against their ANIMA identity — creating
              the first verifiable, accountable, autonomous agent layer on Sui.
            </p>
          </motion.div>

          {/* Right: Component Structure Blueprint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200 p-8 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0241ff]/30 to-transparent" />

            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-[#0241ff]" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">
                NFA Component Blueprint
              </h3>
            </div>

            <div className="flex flex-col gap-4 font-mono text-xs text-zinc-600">
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 flex justify-between items-center hover:border-[#0241ff]/30 hover:bg-blue-50/20 transition-all group">
                <span className="font-medium text-zinc-900">
                  1. Core Struct Identity (UID)
                </span>
                <span className="text-zinc-400 group-hover:text-[#0241ff]">
                  Unique ID
                </span>
              </div>
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 flex justify-between items-center hover:border-[#0241ff]/30 hover:bg-blue-50/20 transition-all group">
                <span className="font-medium text-zinc-900">
                  2. Sovereign Vault Balance
                </span>
                <span className="text-zinc-400 group-hover:text-[#0241ff]">
                  Balance&lt;SUI&gt;
                </span>
              </div>
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 flex justify-between items-center hover:border-[#0241ff]/30 hover:bg-blue-50/20 transition-all group">
                <span className="font-medium text-zinc-900">
                  3. Bound Operator Address
                </span>
                <span className="text-zinc-400 group-hover:text-[#0241ff]">
                  address
                </span>
              </div>
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 flex justify-between items-center hover:border-[#0241ff]/30 hover:bg-blue-50/20 transition-all group">
                <span className="font-medium text-zinc-900">
                  4. Skill Dynamic Registry
                </span>
                <span className="text-zinc-400 group-hover:text-[#0241ff]">
                  Walrus Blob ID
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cognitive Model: NFT vs NFA Paradigm shift */}
        <div className="relative overflow-hidden bg-[#0241ff] rounded-3xl text-white shadow-lg border border-[#0241ff]/20">
          {/* Safe visual background elements: abstract glows and soft shapes */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Aurora
              colorStops={["#000080", "#000080", "#000080"]}
              blend={0.88}
              amplitude={1.0}
              speed={0.5}
            />
          </div>
          <div className="relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="border border-zinc-200 bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-sm"
            >
              <div className="text-center max-w-[600px] mx-auto mb-10">
                <h3 className="text-2xl md:text-3xl font-normal tracking-tight mb-3">
                  NFTs vs. NFAs : The Paradigm Shift
                </h3>
                <p className="text-white/90 text-sm md:text-base font-light">
                  Understand how Non-Fungible Agents evolve the concept of
                  on-chain digital ownership into dynamic autonomous execution.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Interactive Dimension Selector */}
                <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 lg:border-r border-black pr-0 lg:pr-6">
                  {dimensions.map((dim) => (
                    <button
                      key={dim.id}
                      onClick={() => setActiveDimension(dim.id)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer w-full text-left ${
                        activeDimension === dim.id
                          ? "bg-[#0241ff] text-white shadow-md shadow-[#0241ff]/10"
                          : "hover:bg-[#6fa0ff] bg-white text-black hover:text-zinc-900"
                      }`}
                    >
                      {dim.icon}
                      {dim.title}
                    </button>
                  ))}
                </div>

                {/* Comparison Details Panel */}
                <div className="lg:col-span-8 flex flex-col justify-center min-h-[260px] lg:pl-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDimension}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      {/* Left: NFT Column */}
                      <div className="p-6 rounded-2xl border border-dashed border-zinc-200 bg-white flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-zinc-400" />
                          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                            Traditional NFT
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-zinc-800">
                          {currentDimension.nftHighlight}
                        </div>
                        <p className="text-zinc-500 text-sm font-light leading-relaxed">
                          {currentDimension.nftText}
                        </p>
                      </div>

                      {/* Right: NFA Column */}
                      <div className="p-6 rounded-2xl border border-blue-100 bg-white flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute z-30 top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0241ff] animate-ping" />
                          <span className="text-xs uppercase tracking-wider text-[#0241ff] font-semibold">
                            Active NFA
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-[#0241ff]">
                          {currentDimension.nfaHighlight}
                        </div>
                        <p className="text-zinc-600 text-sm font-light leading-relaxed">
                          {currentDimension.nfaText}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div />
      </div>
    </section>
  );
}
