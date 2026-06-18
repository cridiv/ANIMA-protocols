"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Key,
  Database,
  Coins,
  ArrowRight,
  ArrowUpRight,
  Activity,
  CheckCircle,
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface Step {
  id: number;
  stageLabel: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  description: string;
  linkText: string;
  linkHref: string;
  isExternal: boolean;
  actionIcon: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 1,
    stageLabel: "Stage 01",
    title: "Generate Operator Key",
    subtitle: "Initialize local operator credentials",
    icon: Key,
    description:
      "Run the off-chain operator generator to create local cryptographic credentials for the agent runtime. This establishes a secure boundary: the agent signs daily execution tasks via this local key, while your secure main wallet holds ultimate owner authority over the agent container.",
    linkText: "Hot-Wallet Guide",
    linkHref:
      "https://github.com/Anima-sui/ANIMA-protocol/blob/main/docs/HOT_WALLET_GUIDE.md",
    isExternal: true,
    actionIcon: GithubIcon,
  },
  {
    id: 2,
    stageLabel: "Stage 02",
    title: "Walrus Pinning & Minting Agent",
    subtitle: "Register skills & instantiate agent",
    icon: Database,
    description:
      "Pin your agent's behavior manifest (skills.json) to Walrus decentralized storage to get a secure Blob ID. Then, visit the Mint page, enter the operator public key and your Blob ID, and execute the Sui Move call. This binds the operator and manifest to a new on-chain NFA object.",
    linkText: "Go to Mint Page",
    linkHref: "/mint",
    isExternal: false,
    actionIcon: ArrowRight,
  },
  {
    id: 3,
    stageLabel: "Stage 03",
    title: "Fund Sovereign Vault",
    subtitle: "Activate agent self-sufficient balance",
    icon: Coins,
    description:
      "Deposit initial gas (SUI) and operational capital into the NFA's self-contained balance vault. The agent is now fully initialized, funded, and authorized to execute actions on-chain. The human owner retains the OwnerCap to pause the agent or drain the vault at any moment.",
    linkText: "View Agents Live on explorer",
    linkHref: "https://explorer.animasui.xyz",
    isExternal: true,
    actionIcon: ArrowUpRight,
  },
];

export default function HowToUse() {
  return (
    <section className="w-full bg-[#f8f8f8] py-24 md:py-32 relative overflow-hidden">
      {/* Subtle tech background patterns */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#0241ff 1.2px, transparent 1.2px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-[700px] mx-auto mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-2 mb-4 md:mb-5">
            <div className="w-8 md:w-12 h-px bg-[#0241ff]/30" />
            <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold text-[#0241ff] uppercase tracking-wider">
              Deployment Sequence
            </span>
            <div className="w-8 md:w-12 h-px bg-[#0241ff]/30" />
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-tight mb-4 text-[#171717]">
            Cryptographic Handshake Sequence
          </h2>
          <p className="text-zinc-500 text-xs md:text-base font-light leading-relaxed">
            A secure three-stage initialization flow to configure, register, and
            activate your autonomous agent on the Sui network.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Horizontal connecting line behind cards (desktop only) */}
          <div className="hidden md:block absolute left-[15%] right-[15%] top-14 h-0.5 bg-zinc-200/70 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const ActionIcon = step.actionIcon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="bg-white/80 backdrop-blur-md border border-zinc-200/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between items-start shadow-sm hover:shadow-md hover:border-[#0241ff]/30 transition-all duration-300 group min-h-[380px] relative overflow-hidden"
                >
                  {/* Large background step index */}
                  <span className="absolute top-2 right-4 text-7xl md:text-8xl font-mono font-bold text-zinc-100/70 select-none pointer-events-none group-hover:text-[#0241ff]/5 transition-all duration-300">
                    0{step.id}
                  </span>

                  {/* Card Content Top */}
                  <div className="w-full">
                    {/* Circle Icon Container */}
                    <div className="w-12 h-12 rounded-xl bg-[#0241ff]/5 text-[#0241ff] border border-[#0241ff]/10 flex items-center justify-center mb-6 group-hover:bg-[#0241ff] group-hover:text-white group-hover:border-[#0241ff] group-hover:shadow-md group-hover:shadow-[#0241ff]/20 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-semibold text-[#0241ff] uppercase tracking-wider block mb-1">
                      {step.stageLabel}
                    </span>
                    <h3 className="text-lg md:text-xl font-semibold text-zinc-900 mb-1 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-medium tracking-wide mb-4">
                      {step.subtitle}
                    </p>
                    <p className="text-zinc-500 text-xs md:text-sm font-light leading-relaxed mb-6">
                      {step.description}
                    </p>
                  </div>

                  {/* Card Action Link/Button */}
                  <div className="mt-auto w-full pt-4 border-t border-zinc-100">
                    {step.isExternal ? (
                      <a
                        href={step.linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0241ff] hover:text-[#0241ff]/80 transition-colors group/btn"
                      >
                        {step.linkText}
                        <ActionIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    ) : (
                      <Link
                        href={step.linkHref}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0241ff] hover:text-[#0241ff]/80 transition-colors group/btn"
                      >
                        {step.linkText}
                        <ActionIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Core Security Assurance Footer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 md:mt-24 p-5 rounded-2xl bg-white border border-zinc-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto shadow-sm"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-zinc-900">
                Verifiable Cryptographic Isolation
              </h4>
              <p className="text-[11px] md:text-xs text-zinc-500 font-light">
                Every NFA executes logic strictly bound by its Walrus skill
                manifest. No arbitrary transactions allowed.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              href="/mint"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0241ff] hover:bg-[#0241ff]/90 text-white text-xs font-semibold shadow-md shadow-[#0241ff]/15 transition-all"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
