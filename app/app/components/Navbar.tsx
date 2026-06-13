"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed z-50 left-0 top-0 w-full hidden md:block bg-transparent ">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex p-4 backdrop-blur-md items-center gap-2 font-bold text-xl"
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
                href="#agents"
                className="h-full hover:text-[#0241ff] cursor-pointer px-2 tracking-[-0.03em] whitespace-nowrap md:text-sm lg:text-base transition-colors"
              >
                Mint Agents
              </Link>
            </div>

            <div className="group !leading-1.4 text-base relative">
              <Link
                href="explorer"
                className="h-full flex hover:text-[#0241ff] cursor-pointer tracking-[-0.03em] whitespace-nowrap md:text-sm lg:text-base transition-colors"
              >
                Explorer <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Right Side - Icons & CTA */}
          <div className="flex items-center gap-2">
            <div className="flex items-center px-1 rounded-full bg-gray-50 gap-1 border border-gray-200">
              <Link
                href="#"
                className="w-10 h-10 flex items-center justify-center relative group cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                    d="M8.5 8h10m-10 3h10m-10 3h10M7.834 21.749l3.596-3.236A2 2 0 0 1 12.768 18H20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v2.377a.5.5 0 0 0 .834.372ZM6 8.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Zm0 3a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Zm0 3a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="absolute bottom-[-20px] left-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Feedback
                </span>
              </Link>

              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://discord.com"
                className="w-10 h-10 flex items-center justify-center relative group cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                    d="M19.345 5.344A17.4 17.4 0 0 0 14.982 4c-.192.33-.405.779-.555 1.13a16.7 16.7 0 0 0-4.833 0c-.15-.351-.373-.8-.555-1.13a17.2 17.2 0 0 0-4.363 1.344c-2.763 4.075-3.51 8.053-3.136 11.979A17.8 17.8 0 0 0 6.885 20a13 13 0 0 0 1.141-1.845 11 11 0 0 1-1.803-.864c.15-.107.3-.224.438-.342 3.477 1.59 7.244 1.59 10.678 0 .15.118.288.235.438.342a11 11 0 0 1-1.803.864A13 13 0 0 0 17.115 20a17.7 17.7 0 0 0 5.345-2.677c.459-4.544-.726-8.491-3.116-11.979ZM6.607 12.789c0 1.163.854 2.112 1.9 2.112 1.055 0 1.898-.949 1.898-2.112.021-1.162-.843-2.112-1.899-2.112-1.067 0-1.899.95-1.899 2.112Zm7.008 0c0 1.163.855 2.112 1.9 2.112 1.067 0 1.899-.949 1.899-2.112.021-1.162-.843-2.112-1.899-2.112-1.067 0-1.9.95-1.9 2.112Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="absolute bottom-[-20px] left-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Join Discord
                </span>
              </Link>
            </div>

            {/* CTA Button */}
            <Link href="/mint">
              <button className="w-full primary-button inline-flex items-center justify-center gap-2 rounded-full cursor-pointer hover:scale-95 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg mt-2">
                Connect wallet
              </button>
            </Link>
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

            <Link
              href="explorer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-200"
            >
              Explorer <ExternalLink className="w-4 h-4" />
            </Link>

            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://discord.com"
              className="px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              Discord
            </a>

            <Link
              href="/mint"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3"
            >
              <button className="w-full primary-button inline-flex items-center justify-center gap-2 rounded-full cursor-pointer hover:scale-95 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg">
                Connect wallet
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
