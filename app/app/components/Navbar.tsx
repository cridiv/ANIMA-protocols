"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Menu, X, LogOut } from "lucide-react";
import {
  ConnectButton,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";

const Navbar = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed z-20 left-0 top-0 w-full hidden md:block bg-transparent ">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex p-4 px-6 rounded-full backdrop-blur-md items-center gap-2 font-bold text-xl"
          >
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
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              <polygon
                points="6.5,8.5 17.5,8.5 16,11 12,12 8,11"
                fill="white"
              />

              <path
                d="M12 12V14.5M12 14.5L9.5 13.5M12 14.5L14.5 13.5M12 14.5V17"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              <circle cx="12" cy="14.5" r="1" fill="white" />
              <circle cx="9.5" cy="13.5" r="0.8" fill="white" />
              <circle cx="14.5" cy="13.5" r="0.8" fill="white" />
              <circle cx="12" cy="17" r="0.8" fill="white" />
            </svg>

            <span className="font-bold text-lg">
              Anima <span className="text-sm font-light">Sui</span>
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 flex items-center justify-center text-black rounded-full bg-gray-50 md:gap-3 h-12 px-6 lg:px-12 gap-5 border border-gray-200">
            <div className="group !leading-1.4 text-base relative">
              <div className="relative">
                <button
                  onClick={() => setIsAboutOpen(!isAboutOpen)}
                  className="h-full hover:text-[#0241ff] cursor-pointer tracking-[-0.03em] flex items-center gap-1 md:text-sm lg:text-base transition-colors"
                >
                  About
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAboutOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 z-50 ${
                    isAboutOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <div className="px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">
                    <Link
                      href="#"
                      className="block text-sm font-medium text-gray-900 hover:text-[#0241ff] transition-colors"
                    >
                      Whitepaper
                    </Link>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">
                    <Link
                      href="#"
                      className="block text-sm font-medium text-gray-900 hover:text-[#0241ff] transition-colors"
                    >
                      Blog
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="group !leading-1.4 text-base relative">
              <Link
                href="/mint"
                className="h-full hover:text-[#0241ff] cursor-pointer px-2 tracking-[-0.03em] whitespace-nowrap md:text-sm lg:text-base transition-colors"
              >
                Mint Agents
              </Link>
            </div>

            <div className="group !leading-1.4 text-base relative">
              <a
                href="https://explorer.animasui.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="h-full flex items-center hover:text-[#0241ff] cursor-pointer tracking-[-0.03em] whitespace-nowrap md:text-sm lg:text-base transition-colors"
              >
                Explorer <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Right Side - Icons & CTA */}
          <div className="flex items-center gap-2">
            <div className="flex items-center px-1 rounded-full bg-gray-50 gap-1 border border-gray-200">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://x.com"
                className="w-10 h-10 flex items-center justify-center relative group cursor-pointer hover:bg-gray-200 rounded-full transition-colors text-gray-700 hover:text-black"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="absolute bottom-[-20px] left-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Follow on X
                </span>
              </Link>

              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com"
                className="w-10 h-10 flex items-center justify-center relative group cursor-pointer hover:bg-gray-200 rounded-full transition-colors text-gray-700 hover:text-black"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="absolute bottom-[-20px] left-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  GitHub
                </span>
              </Link>
            </div>

            {/* CTA Button */}
            {currentAccount ? (
              <div className="flex items-center gap-2 bg-[#0241ff]/5 border border-[#0241ff]/15 rounded-full px-4 py-1.5 shadow-sm font-mono shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs text-[#0241ff] font-medium">
                  {currentAccount.address.slice(0, 6)}...
                  {currentAccount.address.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="p-1 hover:bg-[#0241ff]/10 rounded-full text-zinc-400 hover:text-red-500 transition-all cursor-pointer shrink-0"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <ConnectButton className="w-full primary-button inline-flex items-center justify-center gap-2 !rounded-full cursor-pointer hover:scale-95 px-5 py-3 text-sm font-medium !text-white transition-all hover:shadow-lg mt-2" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}

      <header className="bg-white fixed z-[999] left-0 top-0 w-full h-16 pl-4 pr-4 flex items-center justify-between overflow-hidden md:hidden border-b border-gray-200">
        {/* Mobile Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              d="M0 6C0 2.68629 2.68629 0 6 0H18C21.3137 0 24 2.68629 24 6V18C24 21.3137 21.3137 24 18 24H6C2.68629 24 0 21.3137 0 18V6Z"
              fill="#4DA2FF"
            />
            <path
              d="M12 6.5C10.5 4.2 7.2 4.2 5.5 6.2C3.2 8.8 4.5 13.2 12 18.5C19.5 13.2 20.8 8.8 18.5 6.2C16.8 4.2 13.5 4.2 12 6.5Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polygon points="6.5,8.5 17.5,8.5 16,11 12,12 8,11" fill="white" />
            <path
              d="M12 12V14.5M12 14.5L9.5 13.5M12 14.5L14.5 13.5M12 14.5V17"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="14.5" r="1" fill="white" />
            <circle cx="9.5" cy="13.5" r="0.8" fill="white" />
            <circle cx="14.5" cy="13.5" r="0.8" fill="white" />
            <circle cx="12" cy="17" r="0.8" fill="white" />
          </svg>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex cursor-pointer items-center gap-4"
        >
          {isMobileMenuOpen ? (
            <X className="w-8 h-6" />
          ) : (
            <Menu className="w-8 h-6" />
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-white border-b border-gray-200 md:hidden z-[998]">
          <div className="flex flex-col">
            <div className="border-b border-gray-200">
              <button
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span className="text-sm font-medium">About</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isAboutOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isAboutOpen && (
                <div className="bg-gray-50 border-t border-gray-200">
                  <Link
                    href="#"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAboutOpen(false);
                    }}
                    className="block px-6 py-2 text-sm text-gray-700 hover:text-[#0241ff] transition-colors"
                  >
                    Whitepaper
                  </Link>
                  <Link
                    href="#"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAboutOpen(false);
                    }}
                    className="block px-6 py-2 text-sm text-gray-700 hover:text-[#0241ff] transition-colors"
                  >
                    Blog
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="#agents"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              Mint Agents
            </Link>

            <a
              href="https://explorer.animasui.xyz"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-200"
            >
              Explorer <ExternalLink className="w-4 h-4" />
            </a>

            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://x.com"
              className="px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              X (Twitter)
            </a>

            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com"
              className="px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              GitHub
            </a>

            <div className="px-4 py-3">
              {currentAccount ? (
                <div className="flex items-center justify-between bg-[#0241ff]/5 border border-[#0241ff]/15 rounded-full px-4 py-2 shadow-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-[#0241ff] font-medium">
                      {currentAccount.address.slice(0, 6)}...
                      {currentAccount.address.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="p-1.5 hover:bg-[#0241ff]/10 rounded-full text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <ConnectButton className="w-full primary-button inline-flex items-center justify-center gap-2 rounded-full cursor-pointer hover:scale-95 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
