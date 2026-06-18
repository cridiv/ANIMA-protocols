"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: 1,
    question: "What is ANIMA?",
    answer:
      "ANIMA is a native agent identity and autonomy protocol built on Sui. It allows humans to mint AI agents as Non-Fungible Agents (NFAs) — unique on-chain objects with their own sovereign wallet, skill registry, and immutable action history, separating governance from execution.",
  },
  {
    id: 2,
    question: "How does the Hot-Wallet isolation protect my main funds?",
    answer:
      "The operator key generated for the agent runtime only holds SUI allocated for execution gas and active operations. Your main wallet holds the OwnerCap capability object, which represents ultimate governance. This OwnerCap lets you pause the agent or drain its balance vault instantly back to your secure cold wallet without exposing your main private key to the off-chain environment.",
  },
  {
    id: 3,
    question: "Is the operator address changeable?",
    answer:
      "Yes, the owner can update the agent's operator address at any time using the Move contract. This allows you to hot-swap host machines or migrate the agent to a different off-chain server without losing its historical reputation, vault balance, or skill manifests.",
  },
  {
    id: 4,
    question: "How does Walrus interface with the Move contract?",
    answer:
      "The Move smart contract stores metadata references as dynamic field keys pointing to Walrus Blob IDs. When the agent attempts an action, validator nodes and indexers can verify its execution parameters against the cryptographically pinned config manifest stored in Walrus, ensuring that the off-chain brain is operating within authorized parameters.",
  },
  {
    id: 5,
    question: "How is NFA reputation computed?",
    answer:
      "Reputation is calculated based on successful transaction loops, contract execution history, and active epoch uptime. Every on-chain event emitted by the agent feeds into its verified profile, which other DeFi protocols inspect before authorizing the NFA to handle assets or interact with custom contract functions.",
  },
  {
    id: 6,
    question: "Can an NFA be paused automatically?",
    answer:
      "Yes. If the agent's off-chain runtime encounters risk limits (e.g., maximum slippage breached, anomaly detected), it can trigger its own pause. Additionally, the human owner can click the kill switch from their dashboard to pause it instantly, locking all funds in the sovereign vault.",
  },
];

export default function Faqs() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      className="w-full py-32 px-4 relative text-black border-t border-white/10 overflow-hidden"
      id="faq"
    >
      {/* Subtle top-fade from previous light section */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-20" />

      <div className="max-w-4xl mx-auto flex flex-col gap-16 relative z-10">
        {/* Section Header */}
        <div className="w-full space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 md:mb-5">
            <div className="w-8 md:w-12 h-px bg-[#0241ff]/30" />
            <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold text-[#0241ff] uppercase tracking-wider">
              FAQs
            </span>
            <div className="w-8 md:w-12 h-px bg-[#0241ff]/30" />
          </div>
          <h2 className="text-4xl md:text-5xl font-normal tracking-tight leading-tight text-black">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQs Accordion rows */}
        <div className="w-full flex flex-col">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="border-b border-[#0241ff] last:border-b-0"
              >
                {/* Accordion Trigger Button */}
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full items-center justify-between py-6 text-left transition-all outline-none hover:text-gray-300 text-black cursor-pointer"
                >
                  <h3 className="text-lg md:text-xl font-mono font-semibold leading-snug pr-8 text-black">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                  </motion.div>
                </button>

                {/* Accordion Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-zinc-500 text-sm md:text-base font-light leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom fade back to light footer */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-20"
        style={{
          background: "linear-gradient(to top, #f8f8f8 0%, transparent 100%)",
        }}
      />
    </section>
  );
}
