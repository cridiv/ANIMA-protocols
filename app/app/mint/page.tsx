"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { Cpu, Shield, Database, Sparkles, CheckCircle2 } from "lucide-react";

export default function MintPage() {
  const [name, setName] = useState("");
  const [operatorAddress, setOperatorAddress] = useState("");
  const [skillBlobId, setSkillBlobId] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintedSuccess, setMintedSuccess] = useState(false);
  const [mintedInfo, setMintedInfo] = useState<{ nfaId: string; ownerCapId: string } | null>(null);

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !operatorAddress || !skillBlobId) return;

    setIsMinting(true);
    // Simulate smart contract interaction (Minting on Sui Testnet)
    setTimeout(() => {
      setIsMinting(false);
      setMintedSuccess(true);
      setMintedInfo({
        nfaId: "0x" + Math.random().toString(16).substr(2, 40),
        ownerCapId: "0x" + Math.random().toString(16).substr(2, 40),
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] text-zinc-900 pb-20">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          
          {/* Left Panel: Form */}
          <div className="lg:w-3/5 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <h2 className="text-2xl font-bold tracking-tight">Mint Non-Fungible Agent</h2>
            </div>

            {mintedSuccess && mintedInfo ? (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-emerald-800">Agent Minted Successfully!</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Your agent has been instantiated as a native Sui object and is now active on the testnet.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-zinc-400 font-bold uppercase">NFA Object ID (Sovereign Identity)</span>
                    <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-xs font-mono text-zinc-800 select-all break-all mt-1">
                      {mintedInfo.nfaId}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-zinc-400 font-bold uppercase">OwnerCap Object ID (Guardian Key)</span>
                    <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-xs font-mono text-zinc-800 select-all break-all mt-1">
                      {mintedInfo.ownerCapId}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex gap-4">
                  <Link href="/agents" className="flex-1">
                    <button className="w-full primary-button rounded-full py-3 text-sm font-bold text-white shadow-md cursor-pointer">
                      View Agent Profile
                    </button>
                  </Link>
                  <button 
                    onClick={() => {
                      setMintedSuccess(false);
                      setName("");
                      setOperatorAddress("");
                      setSkillBlobId("");
                    }} 
                    className="flex-1 border border-zinc-200 hover:bg-zinc-50 rounded-full py-3 text-sm font-bold text-zinc-700 cursor-pointer"
                  >
                    Mint Another Agent
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMint} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anima_Crossover_v1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Operator Public Address</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={operatorAddress}
                    onChange={(e) => setOperatorAddress(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-50/50"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    The autonomous hot-wallet public address generated by your off-chain agent server.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Initial Strategy (Walrus Blob ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="walrus_blob_id..."
                    value={skillBlobId}
                    onChange={(e) => setSkillBlobId(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-50/50"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    The frozen content-addressed config hash containing strategies and execution parameters.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isMinting}
                  className={`w-full primary-button rounded-full py-3.5 text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isMinting ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isMinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Minting NFA on Sui...
                    </>
                  ) : (
                    "Mint Agent NFA"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Panel: Explanation */}
          <div className="lg:w-2/5 flex flex-col gap-6">
            <div className="bg-[#F8FAFF] border border-blue-100 rounded-3xl p-6">
              <h3 className="font-bold text-lg text-blue-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Guardianship Protocol
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                By minting an NFA, you establish a programmatic boundary. You are the **Guardian** of the agent, 
                holding its <code>OwnerCap</code> object, which serves as the ultimate on-chain administrative key.
              </p>
              <p className="text-xs text-zinc-600 leading-relaxed mt-3">
                The agent wallet is sovereign. While it executes trades autonomously using its operator key, 
                you can immediately trigger the **emergency kill switch** if needed, pausing it and draining 
                the vault back to your personal wallet.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-150 rounded-3xl p-6">
              <h3 className="font-bold text-zinc-950 mb-3 flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-zinc-500" />
                Walrus Integration
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Your initial strategy rules and parameters are uploaded to **Walrus**. The generated blob ID is linked 
                directly to the agent object via Sui dynamic fields. This guarantees content-addressed strategy proof 
                and public accountability.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
