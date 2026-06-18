"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { 
  Cpu, 
  Shield, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  Copy, 
  Check, 
  RefreshCw, 
  Wallet, 
  ExternalLink 
} from "lucide-react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  ConnectButton,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { motion, AnimatePresence } from "framer-motion";

const PACKAGE_ID = "0x5f6681ebeff7b6a1a1f333ba20842d47ed822f39e3ca9d06de3a69f2282e6eca";

// Copy Button Sub-component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer shrink-0"
      title="Copy ID"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export default function MintPage() {
  const [name, setName] = useState("");
  const [operatorAddress, setOperatorAddress] = useState("");
  const [skillBlobId, setSkillBlobId] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintedSuccess, setMintedSuccess] = useState(false);
  const [mintedInfo, setMintedInfo] = useState<{ nfaId: string; ownerCapId: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Owned NFAs List State
  const [ownedNFAs, setOwnedNFAs] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingNFAs, setIsLoadingNFAs] = useState(false);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutate: disconnect } = useDisconnectWallet();
  const suiClient = useSuiClient();

  // Fetch Owned NFAs
  const fetchOwnedNFAs = useCallback(async () => {
    if (!currentAccount) {
      setOwnedNFAs([]);
      return;
    }
    setIsLoadingNFAs(true);
    try {
      const response = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::protocol::ANIMA`,
        },
        options: {
          showContent: true,
        },
      });

      const items = response.data.map((item: any) => {
        const objectId = item.data?.objectId || "";
        const fields = item.data?.content?.fields;
        const nameField = fields?.name || "Autonomous Agent";
        return {
          id: objectId,
          name: nameField,
        };
      });
      setOwnedNFAs(items);
    } catch (err) {
      console.error("Error fetching owned NFAs:", err);
    } finally {
      setIsLoadingNFAs(false);
    }
  }, [currentAccount, suiClient]);

  // Effect to load owned NFAs
  useEffect(() => {
    fetchOwnedNFAs();
  }, [fetchOwnedNFAs]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !operatorAddress || !skillBlobId) return;
    if (!currentAccount) {
      setErrorMsg("Please connect your wallet first.");
      return;
    }

    setIsMinting(true);
    setErrorMsg("");

    try {
      const tx = new Transaction();

      // Step 1: Mint the agent identity container and get capability tuples
      const [agent, ownerCap, backendCap] = tx.moveCall({
        target: `${PACKAGE_ID}::protocol::mint_agent`,
        arguments: [
          tx.pure.string(name),
          tx.pure.address(operatorAddress),
        ],
      });

      // Step 2: Authorize initial operational skill capability on Walrus
      tx.moveCall({
        target: `${PACKAGE_ID}::skill_registry::authorize_skill`,
        arguments: [
          agent,
          ownerCap,
          tx.pure.string("main"), // Default skill name
          tx.pure.string(skillBlobId),
        ],
      });

      // Step 3: Publicly share the agent (ANIMA) object
      tx.moveCall({
        target: "0x2::transfer::public_share_object",
        typeArguments: [`${PACKAGE_ID}::protocol::ANIMA`],
        arguments: [agent],
      });

      // Step 4: Transfer OwnerCap and BackendCap to the guardian wallet
      tx.transferObjects([ownerCap, backendCap], currentAccount.address);

      // Execute transaction block using current account provider
      const response = await signAndExecuteTransaction({ transaction: tx });

      // Wait for transaction on-chain validation
      const txBlock = await suiClient.waitForTransaction({
        digest: response.digest,
        options: {
          showObjectChanges: true,
        },
      });

      const objectChanges = txBlock.objectChanges;
      if (objectChanges) {
        let animaId = "";
        let ownerCapId = "";
        for (const change of objectChanges) {
          if (change.type === "created") {
            if (change.objectType === `${PACKAGE_ID}::protocol::ANIMA`) {
              animaId = change.objectId;
            } else if (change.objectType === `${PACKAGE_ID}::protocol::OwnerCap`) {
              ownerCapId = change.objectId;
            }
          }
        }

        setMintedSuccess(true);
        setMintedInfo({
          nfaId: animaId || "Not found in transaction changes",
          ownerCapId: ownerCapId || "Not found in transaction changes",
        });

        // Re-fetch list of owned agents immediately
        fetchOwnedNFAs();
      } else {
        throw new Error("No object changes detected in the transaction effects.");
      }
    } catch (err: any) {
      console.error("Failed to mint ANIMA NFA:", err);
      setErrorMsg(err.message || "Failed to execute transaction on Sui Testnet.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-zinc-900 pb-24 relative overflow-hidden">
      {/* Decorative background grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(#0241ff 1.2px, transparent 1.2px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <Navbar />

      <main className="container mx-auto px-4 md:px-8 pt-32 max-w-[1140px] relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#0241ff]/40" />
            <span className="text-[10px] md:text-xs font-semibold text-[#0241ff] uppercase tracking-wider">
              Genesis Protocol
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-normal tracking-tight text-zinc-900 leading-tight">
            Agent Registry Portal
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm font-light mt-1.5 leading-relaxed">
            Configure operator keys, pin rules to Walrus, and mint autonomous containers onto the Sui network.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Form / Success Card */}
          <div className="lg:col-span-7">
            <motion.div
              layout
              className="bg-white border border-zinc-200/60 rounded-3xl p-6 md:p-8 shadow-sm relative"
            >
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-100">
                <Sparkles className="w-5 h-5 text-[#0241ff] animate-pulse" />
                <h2 className="text-lg md:text-xl font-semibold tracking-tight text-zinc-900">
                  {mintedSuccess ? "Instantiated Container" : "Configuration Parameters"}
                </h2>
              </div>

              {!currentAccount ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50/50 border border-zinc-200/60 border-dashed rounded-2xl p-6">
                  <Shield className="w-12 h-12 text-[#0241ff]/40 mb-3" />
                  <h3 className="font-semibold text-base text-zinc-800">Wallet Disconnected</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mb-6 leading-relaxed">
                    To instantiate your sovereign Non-Fungible Agent on Sui Testnet, please connect your secure Guardian wallet.
                  </p>
                  <div className="flex justify-center w-full">
                    <ConnectButton className="primary-button !rounded-full !px-5 !py-3 hover:scale-95 transition-all text-sm font-semibold !text-white shadow-md shadow-blue-500/10" />
                  </div>
                </div>
              ) : mintedSuccess && mintedInfo ? (
                <div className="space-y-6">
                  {/* Success Banner */}
                  <div className="bg-emerald-500/[0.04] border border-emerald-500/25 rounded-2xl p-5 flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm md:text-base">
                        Agent Minted Successfully
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        The agent has been instantiated on Sui. Your secure wallet holds governance permissions (`OwnerCap`), while the off-chain operator holds daily execution keys.
                      </p>
                    </div>
                  </div>

                  {/* ID displays */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        NFA Object ID (Sovereign Identity)
                      </span>
                      <div className="bg-zinc-50 border border-zinc-200/60 p-3.5 rounded-xl text-xs font-mono text-zinc-800 flex items-center justify-between gap-4 mt-1.5 hover:bg-zinc-50 transition-colors">
                        <span className="break-all select-all font-medium leading-relaxed">{mintedInfo.nfaId}</span>
                        <CopyButton text={mintedInfo.nfaId} />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        OwnerCap Object ID (Guardian Key)
                      </span>
                      <div className="bg-zinc-50 border border-zinc-200/60 p-3.5 rounded-xl text-xs font-mono text-zinc-800 flex items-center justify-between gap-4 mt-1.5 hover:bg-zinc-50 transition-colors">
                        <span className="break-all select-all font-medium leading-relaxed">{mintedInfo.ownerCapId}</span>
                        <CopyButton text={mintedInfo.ownerCapId} />
                      </div>
                    </div>
                  </div>

                  {/* Action triggers */}
                  <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-4">
                    <a
                      href={`https://explorer.animasui.xyz/agents/${mintedInfo.nfaId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <button className="w-full primary-button rounded-xl py-3 text-xs md:text-sm font-semibold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-transform">
                        View in Explorer
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </a>
                    
                    <button 
                      onClick={() => {
                        setMintedSuccess(false);
                        setName("");
                        setOperatorAddress("");
                        setSkillBlobId("");
                      }} 
                      className="flex-1 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl py-3 text-xs md:text-sm font-semibold text-zinc-600 transition-colors cursor-pointer"
                    >
                      Mint Another Agent
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleMint} className="space-y-5">
                  {errorMsg && (
                    <div className="bg-red-500/[0.04] border border-red-500/20 rounded-xl p-4 text-xs text-red-600 leading-relaxed break-all">
                      {errorMsg}
                    </div>
                  )}

                  {/* Input: Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DeFi_Arbitrageur_v2"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-[#0241ff]/30 focus:ring-1 focus:ring-[#0241ff]/10 rounded-xl p-3 text-sm focus:outline-none bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                    />
                  </div>

                  {/* Input: Operator Address */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Operator Public Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0x..."
                      value={operatorAddress}
                      onChange={(e) => setOperatorAddress(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-[#0241ff]/30 focus:ring-1 focus:ring-[#0241ff]/10 rounded-xl p-3 text-sm font-mono focus:outline-none bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                    />
                    <span className="text-[10px] text-zinc-400 mt-2 block leading-relaxed">
                      The autonomous hot-wallet public address generated by your off-chain agent host daemon.
                    </span>
                  </div>

                  {/* Input: Blob ID */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Initial Strategy (Walrus Blob ID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. W-BLOB-98c7e1f402a3..."
                      value={skillBlobId}
                      onChange={(e) => setSkillBlobId(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-[#0241ff]/30 focus:ring-1 focus:ring-[#0241ff]/10 rounded-xl p-3 text-sm font-mono focus:outline-none bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                    />
                    <span className="text-[10px] text-zinc-400 mt-2 block leading-relaxed">
                      The frozen, content-addressed config manifest pinned to Walrus decentralized storage.
                    </span>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isMinting}
                    className={`w-full primary-button rounded-xl py-3.5 text-xs md:text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isMinting ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.99]"
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
            </motion.div>
          </div>

          {/* Right Panel: Active Wallet & Owned NFAs & Guide */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Wallet Panel Info */}
            {currentAccount && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200/60 rounded-3xl p-5 shadow-sm"
              >
                <h3 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-zinc-500" />
                  Active Connected Wallet
                </h3>
                
                <div className="flex items-center justify-between gap-4 bg-zinc-50 border border-zinc-200/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium text-zinc-800">
                      {currentAccount.address.slice(0, 10)}...{currentAccount.address.slice(-6)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => disconnect()}
                    className="text-[10px] font-semibold text-red-600 hover:text-red-700 bg-red-500/5 border border-red-500/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            )}

            {/* Owned NFAs List Panel */}
            {currentAccount && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-sm flex flex-col min-h-[280px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                  <h3 className="font-semibold text-sm text-zinc-900 tracking-tight flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#0241ff]" />
                    Your Owned NFAs
                  </h3>
                  
                  <button
                    onClick={fetchOwnedNFAs}
                    disabled={isLoadingNFAs}
                    className="p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNFAs ? "animate-spin text-[#0241ff]" : ""}`} />
                  </button>
                </div>

                {isLoadingNFAs ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-2">
                    <RefreshCw className="w-6 h-6 text-[#0241ff] animate-spin" />
                    <span className="text-xs text-zinc-400">Syncing ledger objects...</span>
                  </div>
                ) : ownedNFAs.length > 0 ? (
                  <div className="flex-grow overflow-y-auto max-h-[300px] pr-1 space-y-3">
                    {ownedNFAs.map((nfa) => (
                      <div
                        key={nfa.id}
                        className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/40 hover:border-[#0241ff]/30 hover:bg-white transition-all group relative"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-zinc-800 truncate group-hover:text-zinc-950">
                              {nfa.name}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                              {nfa.id.slice(0, 8)}...{nfa.id.slice(-6)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <CopyButton text={nfa.id} />
                            <a
                              href={`https://explorer.animasui.xyz/agents/${nfa.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-[#0241ff] transition-colors"
                              title="Open in Explorer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-zinc-400">
                    <Cpu className="w-8 h-8 opacity-25 mb-2" />
                    <p className="text-xs font-light">No NFAs found in this wallet</p>
                    <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">
                      Mint your first agent using the form on the left.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Guardianship Rules Panel */}
            <div className="bg-[#F8FAFF] border border-blue-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-blue-900 mb-3.5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Guardianship Bounds
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                NFAs run off-chain brain execution in a completely isolated environment. The connected wallet holds the <code>OwnerCap</code> key.
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed font-light mt-3">
                This asymmetric structure allows you to pause the container on-chain or withdraw its funds at any moment, preventing off-chain compromise from affecting your main wallet.
              </p>
            </div>

            {/* Walrus details */}
            <div className="bg-zinc-50 border border-zinc-200/50 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2 text-xs">
                <Database className="w-4 h-4 text-zinc-500" />
                Walrus Verification
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Strategy manifests compiled into JSON config maps are uploaded to **Walrus** to secure a immutable Blob ID. This reference is dynamically stored inside the Sui object's skill registry.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
