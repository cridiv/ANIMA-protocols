"use client";

import React, { useState } from "react";
import { Menu, Wifi } from "lucide-react";

const Navbar = () => {
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="z-20 flex items-center px-2 sm:px-8 md:px-12 text-sm font-medium"
      style={{ height: "72px" }}
    >
      {/* Logo and Brand */}
      <a className="flex items-center" href="/">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2 h-6 w-6"
        >
          <path
            d="M0 6C0 2.68629 2.68629 0 6 0H18C21.3137 0 24 2.68629 24 6V18C24 21.3137 21.3137 24 18 24H6C2.68629 24 0 21.3137 0 18V6Z"
            fill="#4DA2FF"
          />

          <path
            d="M12 6.5C10.5 4.2 7.2 4.2 5.5 6.2C3.2 8.8 4.5 13.2 12 18.5C19.5 13.2 20.8 8.8 18.5 6.2C16.8 4.2 13.5 4.2 12 6.5Z"
            stroke="white"
            stroke-width="1.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          <polygon points="6.5,8.5 17.5,8.5 16,11 12,12 8,11" fill="white" />

          <path
            d="M12 12V14.5M12 14.5L9.5 13.5M12 14.5L14.5 13.5M12 14.5V17"
            stroke="white"
            stroke-width="1.2"
            stroke-linecap="round"
          />

          <circle cx="12" cy="14.5" r="1" fill="white" />
          <circle cx="9.5" cy="13.5" r="0.8" fill="white" />
          <circle cx="14.5" cy="13.5" r="0.8" fill="white" />
          <circle cx="12" cy="17" r="0.8" fill="white" />
        </svg>

        <span className="font-bold text-lg">
          Anima <span className="text-sm font-light">Explorer</span>
        </span>
      </a>

      {/* Navigation - Desktop */}
      <nav className="ml-8 hidden md:flex max-header2:ml-4">
        {/* Blockchain Dropdown */}
        <div className="relative inline-block text-left">
          <button
            onClick={() => setIsBlockchainOpen(!isBlockchainOpen)}
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm hover:text-brand"
          >
            Home
          </button>
        </div>

        {/* Validators Link */}
        <a className="rounded px-3 py-2 hover:text-brand" href="/agents">
          Agents {`(NFAs)`}
        </a>

        {/* Coins Link */}
        <a className="rounded px-3 py-2 hover:text-brand" href="/coins">
          Coins
        </a>
      </nav>

      {/* Right Side Actions */}
      <div className="ml-auto flex items-center gap-x-2 md:gap-x-3">
        {/* Connect Wallet Button - Hidden on small screens */}
        <button className="hidden sm:inline-flex items-center primary-button gap-2 rounded-full cursor-pointer hover:scale-95 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg">
          Connect wallet
        </button>

        {/* Theme Toggle Button */}
        <div className="pointer-events-auto  bg-[#6fa0ff]/15 px-4 py-2 rounded-full">
          <Wifi className="inline-block text-green-400 h-4 w-4 mr-0.5 mb-0.5" />{" "}
          Testnet
        </div>

        {/* Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="cursor-pointer bg-body p-2"
          >
            <Menu className="w-8 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-background md:hidden border-b shadow-lg">
          <nav className="flex flex-col px-4 py-4 gap-y-2">
            <button
              onClick={() => setIsBlockchainOpen(!isBlockchainOpen)}
              className="flex cursor-pointer items-center rounded px-3 py-2 text-sm hover:text-brand text-left w-full"
            >
              Home
            </button>
            <a
              className="rounded px-3 py-2 hover:text-brand text-sm block"
              href="/agents"
            >
              Agents {`(NFAs)`}
            </a>

            <a className="rounded px-3 py-2 hover:text-brand" href="/coins">
              Coins
            </a>

            <button className="w-full primary-button inline-flex items-center justify-center gap-2 rounded-full cursor-pointer hover:scale-95 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg mt-2">
              Connect wallet
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
