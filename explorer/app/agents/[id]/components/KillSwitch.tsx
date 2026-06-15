"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, X, Check, Loader2 } from "lucide-react";

interface KillSwitchProps {
  hasOwnerCap?: boolean;
  onConfirmKill?: () => Promise<void>;
  isExecuting?: boolean;
  isPaused?: boolean;
}

export default function KillSwitch({
  hasOwnerCap = true,
  onConfirmKill = async () => {
    await new Promise((r) => setTimeout(r, 1500));
  },
  isExecuting = false,
  isPaused = false,
}: KillSwitchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExecutingLocal, setIsExecutingLocal] = useState(false);

  const handleConfirm = async () => {
    setErrorMessage("");
    setIsExecutingLocal(true);
    try {
      await onConfirmKill();
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Emergency kill failed:", err);
      setErrorMessage(err.message || "Failed to trigger emergency kill switch.");
    } finally {
      setIsExecutingLocal(false);
    }
  };

  const activeExecuting = isExecuting || isExecutingLocal;

  return (
    <div className="glass-card p-6 flex flex-col gap-5 text-sm h-full">
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <ShieldAlert className="text-red-400" size={18} />
        <h2 className="text-base font-semibold text-background">
          Emergency Intervention
        </h2>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        If this agent goes rogue, experiences severe slippage, or is executing
        malicious calls, the Guardian context can override autonomy immediately.
      </p>

      {isPaused ? (
        <div className="flex flex-col gap-3">
          <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="shrink-0 text-red-400" size={16} />
            <div>
              <span className="font-semibold text-background block mb-0.5">
                Agent is Paused
              </span>
              The emergency hatch has already been triggered. The agent is paused on-chain, and all vault funds have been drained.
            </div>
          </div>

          <button
            disabled={true}
            className="w-full py-3 px-4 rounded-xl font-bold bg-zinc-800 text-zinc-500 border border-zinc-700/30 tracking-wider uppercase text-xs cursor-not-allowed flex items-center justify-center gap-2"
          >
            Agent Already Paused
          </button>
        </div>
      ) : hasOwnerCap ? (
        <div className="flex flex-col gap-3">
          <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="shrink-0 text-red-400" size={16} />
            <div>
              <span className="font-semibold text-background block mb-0.5">
                Guardian Cap Detected
              </span>
              Your connected wallet holds the owner capability (`OwnerCap`)
              object required to pause this agent.
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-3 px-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 active:scale-[0.98] text-background tracking-wider uppercase text-xs transition-all shadow-[0_4px_20px_rgba(220,38,38,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            ⚡ TRIGGER EMERGENCY KILL
          </button>
        </div>
      ) : (
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-gray-400 flex items-start gap-2.5">
          <AlertTriangle className="shrink-0 text-gray-500" size={16} />
          <div>
            <span className="font-semibold text-background block mb-0.5">
              Emergency Controls Locked
            </span>
            Connect the wallet holding this agent's `OwnerCap` to activate the
            emergency hatch.
          </div>
        </div>
      )}

      {/* Confirmation & Success Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 border-red-500/30 flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Check size={24} />
                </div>
                <h3 className="font-bold text-base text-background">Emergency Kill Executed</h3>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed mt-1">
                  The agent has been permanently paused on-chain, and all remaining vault funds have been drained back to your wallet.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSuccess(false);
                    window.location.reload();
                  }}
                  className="mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-background transition-colors cursor-pointer"
                >
                  Close & Refresh Page
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle size={20} />
                    <h2>CRITICAL EMERGENCY WARNING</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={activeExecuting}
                    className="text-gray-400 hover:text-background transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>

                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 leading-relaxed break-all">
                    {errorMessage}
                  </div>
                )}

                <div className="text-xs text-gray-300 flex flex-col gap-3 leading-relaxed">
                  <p>
                    Triggering the emergency hatch is an **irreversible operation**
                    for the active agent lifecycle:
                  </p>
                  <ul className="list-disc pl-5 flex flex-col gap-1.5 text-gray-400">
                    <li>
                      The agent's state machine will be permanently set to{" "}
                      <strong className="text-background">PAUSED</strong>.
                    </li>
                    <li>
                      All active off-chain monitoring, prediction, and routing
                      triggers will immediately abort.
                    </li>
                    <li>
                      <strong className="text-background">
                        All encapsulated SUI tokens
                      </strong>{" "}
                      inside the agent object will be drained and transferred to
                      your wallet address.
                    </li>
                  </ul>
                  <p className="font-semibold text-red-300 bg-red-950/20 p-2.5 rounded border border-red-900/30">
                    Warning: Any off-chain transactions currently in progress on
                    DeepBook may fail due to atomic checks.
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={activeExecuting}
                    className="flex-1 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-semibold text-xs text-background transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={activeExecuting}
                    className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-background font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {activeExecuting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Executing...
                      </>
                    ) : (
                      "Confirm & Pause"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
