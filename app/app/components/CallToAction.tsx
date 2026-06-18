"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Terminal,
  ExternalLink,
  Cpu,
} from "lucide-react";
import Aurora from "./animations/Aurora";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
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

export default function CallToAction() {
  return (
    <section
      className="w-full bg-[#f8f8f8] pb-24 md:pb-32 relative overflow-hidden"
      id="cta"
    >
      <div className="w-[100%] mx-auto px-4 md:px-8 relative z-10">
        {/* Main CTA Card */}
        <div className="relative overflow-hidden bg-[#0241ff] rounded-3xl text-white shadow-xl border border-[#0241ff]/20">
          {/* Safe visual background elements: abstract glows and soft shapes */}
          <div className="absolute w-full inset-0 pointer-events-none z-0">
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
              className="border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-14 shadow-sm flex flex-col items-center text-center"
            >
              {/* Core Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-6">
                <Cpu className="w-3.5 h-3.5" />
                Autonomous Engine Ready
              </div>

              {/* Main Headline */}
              <h3 className="text-3xl md:text-5xl font-normal tracking-tight leading-tight mb-4 max-w-[750px]">
                Power Your Protocol with Autonomous Agents
              </h3>

              {/* Description */}
              <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-[600px] mb-10">
                Deploy secure, sovereign Non-Fungible Agents on Sui. Delegate
                complex trading strategies, indexer synchronizations, or
                automated operations to verifiable off-chain workers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-16">
                <Link
                  href="/mint"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-[#0241ff] text-sm font-semibold shadow-lg shadow-black/10 transition-colors"
                >
                  Mint New Agent
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://explorer.animasui.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-colors"
                >
                  View Agentic Explorer
                  <ExternalLink className="w-4 h-4 opacity-75" />
                </a>
              </div>

              {/* Quick Resources Footer Grid inside Card */}
              <div className="w-full border-t border-white/10 pt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Resource item 1 */}
                <a
                  href="https://github.com/Anima-sui/ANIMA-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 p-4 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 shrink-0">
                    <GithubIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-1 group-hover:text-blue-200 transition-colors">
                      Open Source Core
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </h4>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      Inspect the ANIMA protocol Move contracts and off-chain
                      Agents core.
                    </p>
                  </div>
                </a>

                {/* Resource item 2 */}
                <a
                  href="https://github.com/Anima-sui/ANIMA-protocol/tree/main/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 p-4 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-1 group-hover:text-blue-200 transition-colors">
                      Developer Docs
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </h4>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      Read about structural safety bounds, dynamic field
                      schemas, and permission APIs.
                    </p>
                  </div>
                </a>

                {/* Resource item 3 */}
                <a
                  href="https://explorer.animasui.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 p-4 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 shrink-0">
                    <Terminal className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-1 group-hover:text-blue-200 transition-colors">
                      ANIMA Explorer
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </h4>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      Browse active NFAs, event telemetry, and historical
                      execution records on Sui.
                    </p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
