"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Grainient from "@/app/components/animations/Grainient";
import { Wallet, Shield, Cpu, History, ShieldAlert } from "lucide-react";

// Import structured widgets
import AgentHeader from "./components/AgentHeader";
import IdentityPanel from "./components/IdentityPanel";
import WalletPanel from "./components/WalletPanel";
import SkillRegistry from "./components/SkillRegistry";
import ActionFeed from "./components/ActionFeed";
import KillSwitch from "./components/KillSwitch";

type TabType = "overview" | "skills" | "activity" | "emergency";

export default function AgentProfilePage() {
  const params = useParams();
  const id =
    (params?.id as string) ||
    "0x63b6429339342dd64edd48c56420983c1dd37b4d8e573123e051a4cf52a092a1";

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  return (
    <div className="relative min-h-screen flex flex-col bg-accent text-white overflow-hidden">
      {/* Dynamic Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#0241ff"
          color2="#000000"
          color3="#6fa0ff"
          timeSpeed={0.15}
          colorBalance={-0.2}
          warpStrength={0.8}
          warpFrequency={4}
          warpSpeed={1.5}
          warpAmplitude={40}
          blendAngle={45}
          blendSoftness={0.7}
          rotationAmount={300}
          noiseScale={2}
          grainAmount={0.08}
          grainScale={1.5}
          grainAnimated={false}
          contrast={2.2}
          gamma={1}
          saturation={0.9}
          centerX={0}
          centerY={0}
          zoom={0.85}
        />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-[calc(100%-1rem)] bg-foreground rounded-tl-3xl rounded-tr-3xl max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Header block: Name, status, ID */}
          <AgentHeader
            objectId={id}
            name="Atlas V1 (AI Sovereign Agent)"
            isPaused={false}
          />

          {/* Navigation Tabs Bar */}
          <div className="flex border-b border-white/10 gap-x-1 sm:gap-x-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "overview"
                  ? "text-background border-[#0241ff] bg-white/5"
                  : "text-gray-400 border-transparent hover:text-background hover:bg-white/[0.02]"
              }`}
            >
              <Wallet size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "skills"
                  ? "text-background border-[#0241ff] bg-white/5"
                  : "text-gray-400 border-transparent hover:text-background hover:bg-white/[0.02]"
              }`}
            >
              <Cpu size={16} />
              Skills Registry
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "activity"
                  ? "text-background border-[#0241ff] bg-white/5"
                  : "text-gray-400 border-transparent hover:text-background hover:bg-white/[0.02]"
              }`}
            >
              <History size={16} />
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === "emergency"
                  ? "text-red-400 border-red-500 bg-red-500/5"
                  : "text-gray-400 border-transparent hover:text-red-400 hover:bg-white/[0.02]"
              }`}
            >
              <ShieldAlert size={16} />
              Emergency Controls
            </button>
          </div>

          {/* Conditional Tab Rendering */}
          <div className="w-full transition-opacity duration-300">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-fadeIn">
                <WalletPanel balanceSui={450.75} totalVolumeSui={1840.5} />
                <IdentityPanel
                  ownerCapId="0x2dbccc75d6f9d21987786ea3a70820246391a97b0457a7218e12a134f2c9f90"
                  reputationScore={142}
                />
              </div>
            )}

            {activeTab === "skills" && (
              <div className="w-full animate-fadeIn">
                <SkillRegistry />
              </div>
            )}

            {activeTab === "activity" && (
              <div className="w-full animate-fadeIn">
                <ActionFeed />
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="max-w-2xl mx-auto w-full animate-fadeIn">
                <KillSwitch hasOwnerCap={true} />
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
