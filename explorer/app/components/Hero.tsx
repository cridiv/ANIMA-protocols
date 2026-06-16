"use client";

import { Cpu, Activity, Database, Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { formatAmount } from "@/lib/utils";
import { suiClient } from "@/lib/sui";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    objectId: string;
    name: string;
  } | null>(null);
  const [noDataFound, setNoDataFound] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const router = useRouter();
  const { stats, loading } = useProtocolStats();
  const containerRef = useRef<HTMLFormElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("anima_search_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse search history:", e);
      }
    }
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search on input change
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResult(null);
      setNoDataFound(false);
      return;
    }

    if (!trimmed.startsWith("0x")) {
      setSearchResult(null);
      setNoDataFound(true);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setNoDataFound(false);
      setSearchResult(null);
      try {
        const response = await suiClient.getObject({
          id: trimmed,
          options: { showContent: true },
        });

        if (
          response.data &&
          response.data.content &&
          response.data.content.dataType === "moveObject"
        ) {
          const fields = response.data.content.fields as any;
          const objectName = fields?.name || "Agent Object";
          setSearchResult({
            objectId: trimmed,
            name: objectName,
          });
        } else {
          setNoDataFound(true);
        }
      } catch (err) {
        console.error("Search query lookup failed:", err);
        setNoDataFound(true);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToHistory = (id: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const next = [id, ...filtered].slice(0, 10);
      localStorage.setItem("anima_search_history", JSON.stringify(next));
      return next;
    });
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem("anima_search_history");
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item !== id);
      localStorage.setItem("anima_search_history", JSON.stringify(next));
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    addToHistory(query);
    setIsDropdownOpen(false);
    router.push(`/agents/${query}`);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const totalVolumeSui = parseFloat(stats.totalVolume) / 1_000_000_000;

  return (
    <section className="py-12">
      <div className="relative z-10">
        {/* Title */}
        <h1 className="mt-12 text-center text-4xl max-sm:mt-8 max-sm:text-2xl">
          Explore the Agentic Sui Blockchain
        </h1>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          ref={containerRef}
          className="relative z-50 mx-auto mt-8 max-w-[730px] max-sm:px-4"
        >
          <div style={{ height: "56px" }} className="relative">
            <div className="relative rounded-full">
              <input
                type="text"
                placeholder="Search by ANIMA Object ID (0x...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsDropdownOpen(false);
                  }
                }}
                className="w-full rounded-full bg-foreground p-6 text-sm shadow-#1 backdrop-blur-sm placeholder:font-normal text-background h-[56px] pr-[128px] focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <span
                className="absolute flex h-7 w-7 items-center justify-center rounded-md bg-[#0241ff]/40 primary-text max-sm:hidden top-1/2 -translate-y-1/2 transform"
                style={{ right: "100px" }}
              >
                /
              </span>
              {isSearching ? (
                <div className="absolute right-1 top-1 flex items-center justify-center rounded-full bg-brand h-12 w-[76px]">
                  <span className="animate-spin rounded-full border-2 border-black/20 border-r-transparent h-5 w-5"></span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="absolute primary-button cursor-pointer right-1 top-1 flex items-center justify-center rounded-full h-12 w-[76px] hover:opacity-90 transition-opacity"
                >
                  <Search />
                </button>
              )}
            </div>

            {/* Dropdown panel */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 z-40 mt-2 max-h-[600px] border-none overflow-auto overscroll-contain rounded-2xl shadow-#1 max-sm:max-h-[360px] bg-modal backdrop-blur-xl">
                {searchQuery.trim() === "" ? (
                  history.length > 0 && (
                    <div className="overflow-auto py-2 text-left">
                      <div className="flex px-[18px] pt-2">
                        <span className="text-xs text-secondary">History</span>
                        <button
                          type="button"
                          onClick={handleClearHistory}
                          className="ml-auto rounded px-2 text-xs text-brand cursor-pointer hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                      <ul className="mt-3 flex flex-wrap gap-1.5 px-4 pb-2">
                        {history.map((item) => (
                          <a
                            key={item}
                            className="flex items-center gap-1 rounded-full border border-white/10 px-1.5 py-0.5 text-sm hover:bg-subtle text-white"
                            href={`/agents/${item}`}
                            onClick={() => {
                              addToHistory(item);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="bg-subtle mr-1 rounded-full p-0.5">
                              <svg
                                width="20"
                                height="21"
                                viewBox="0 0 20 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-secondary"
                              >
                                <path
                                  d="M10.6257 3.19092H3.95898V18.6076H16.0423V8.60758M10.6257 3.19092L16.0423 8.60758M10.6257 3.19092V8.60758H16.0423M7.29232 11.9409H10.209M7.29232 15.2743H12.709"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </div>
                            <span className="inline-block max-w-[200px] truncate">
                              {formatAddress(item)}
                            </span>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 cursor-pointer text-secondary hover:text-red-500"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveHistoryItem(item);
                              }}
                            >
                              <path
                                d="M5 15L15 5M5 5L15 15"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                          </a>
                        ))}
                      </ul>
                    </div>
                  )
                ) : (
                  <>
                    {searchResult && (
                      <div className="pb-2 text-left">
                        <div className="mt-3">
                          <p className="pl-[18px] text-xs text-secondary">
                            Object
                          </p>
                          <a
                            id={`Object${searchResult.objectId}`}
                            tabIndex={-1}
                            className="group relative mx-2 mt-0.5 flex cursor-pointer items-center justify-between gap-1 rounded-xl px-4 py-3 hover:bg-inactive focus-visible:bg-inactive focus-visible:outline-none bg-inactive text-white"
                            href={`/agents/${searchResult.objectId}`}
                            onClick={() => {
                              addToHistory(searchResult.objectId);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <section className="flex items-center">
                              <div className="relative mr-3 h-8 w-8 shrink-0">
                                <div className="bg-subtle rounded-full mr-0 p-1.5">
                                  <svg
                                    width="20"
                                    height="21"
                                    viewBox="0 0 20 21"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-secondary h-5 w-5"
                                  >
                                    <path
                                      d="M10.0002 10.8994V17.9827M10.0002 10.8994L3.75 7.38378M10.0002 10.8994L16.0523 7.49503M10 3.16504L3.125 7.03223V14.7666L10 18.6338L16.875 14.7666V7.03223L10 3.16504Z"
                                      stroke="currentColor"
                                      strokeWidth="1.25"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div>
                                <h4 className="flex items-center text-sm font-bold">
                                  <span>{searchResult.name}</span>
                                </h4>
                                <p className="line-clamp-1 break-all text-xs text-secondary">
                                  {searchResult.objectId}
                                </p>
                              </div>
                            </section>
                            <svg
                              width="36"
                              height="24"
                              viewBox="0 0 36 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="z-3 absolute right-4 h-6 w-8 max-md:hidden"
                            >
                              <rect
                                width="36"
                                height="24"
                                rx="8"
                                fill="white"
                              ></rect>
                              <path
                                d="M15.3352 15.4986L12.3821 12.5455L15.3352 9.59233V15.4986ZM14.4304 13.0824V12.0085H23.3693V13.0824H14.4304ZM22.3253 13.0824V6.81818H23.3991V13.0824H22.3253Z"
                                fill="#111827"
                              ></path>
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                    {noDataFound && !isSearching && (
                      <div className="flex h-full flex-col justify-center py-6 text-center max-sm:py-8">
                        <svg
                          width="50"
                          height="45"
                          viewBox="0 0 50 45"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mx-auto w-[150px] max-sm:h-12 max-sm:w-12"
                        >
                          <g id="inbox">
                            <g id="box">
                              <path
                                id="Union"
                                opacity={0.5}
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M42.4247 4.45968L49.7713 23.7348C49.9043 24.079 49.9794 24.44 49.9963 24.8033C49.9989 24.8533 50.0001 24.9031 50 24.9527C50.0009 25.2861 49.953 25.6197 49.856 25.9426C49.8427 25.9868 49.8285 26.0309 49.8133 26.0747L49.8493 26.0864L49.8491 26.0871L45.4862 39.8572C45.0744 41.1571 44.2646 42.2912 43.1737 43.0958C42.0828 43.9004 40.7671 44.334 39.4166 44.334H10.4303C9.06868 44.334 7.74284 43.8933 6.64707 43.0764C5.55131 42.2595 4.74322 41.1094 4.34125 39.7946L0.149581 26.0833C0.133167 26.0298 0.128729 25.9732 0.136585 25.9176C0.044518 25.6024 -0.000862625 25.2775 1.24169e-05 24.9532C-0.000140071 24.9027 0.00111344 24.8521 0.00380525 24.8013C0.0209589 24.4384 0.0960775 24.0783 0.228555 23.7353L7.57472 4.45968C7.67177 4.20504 7.78435 3.95788 7.91146 3.71948C8.3482 2.77171 9.02913 1.95691 9.88598 1.36249C10.8517 0.692568 11.9955 0.333987 13.1668 0.333984H13.5217C13.5217 0.333984 13.5218 0.333984 13.5218 0.333984H36.4775C36.4776 0.333984 36.4776 0.333984 36.4777 0.333984H36.8332C38.0045 0.333987 39.1483 0.692568 40.114 1.36249C40.9734 1.9587 41.6559 2.77662 42.0925 3.72804C42.2177 3.9638 42.3288 4.20809 42.4247 4.45968ZM1.6114 27.4445L5.29756 39.5022C5.63767 40.6147 6.32081 41.5858 7.24476 42.2747C8.16855 42.9633 9.28493 43.334 10.4303 43.334H39.4166C40.5527 43.334 41.6604 42.9694 42.5801 42.291C43.4999 41.6126 44.1844 40.655 44.5329 39.5552L48.367 27.4541C48.041 27.5965 47.6788 27.6763 47.2921 27.6763H39.1222C38.022 27.6764 36.9418 27.9741 35.9938 28.5387C35.0459 29.1032 34.2647 29.9139 33.7315 30.8866C33.1404 31.9653 32.2743 32.8645 31.2231 33.4906C30.1719 34.1166 28.974 34.4468 27.7538 34.4468H21.9859C20.7897 34.4469 19.6163 34.1159 18.593 33.4898C17.5698 32.8636 16.7357 31.9662 16.1814 30.8949C15.6789 29.9242 14.9231 29.1111 13.9959 28.5437C13.0687 27.9764 12.0055 27.6764 10.9216 27.6763H2.70792C2.31261 27.6763 1.94289 27.5929 1.6114 27.4445ZM48.9997 24.9231C48.9995 24.9121 48.9993 24.9012 48.9989 24.8903C48.9928 24.701 48.9554 24.5075 48.8822 24.3156L48.8822 24.3155L41.3086 4.44308L41.3086 4.44304C41.2735 4.35115 41.2358 4.26056 41.1956 4.17139C40.7911 3.41977 40.2158 2.77295 39.5142 2.28627C38.6195 1.66553 37.5608 1.334 36.4777 1.33398C36.4776 1.33398 36.4776 1.33398 36.4775 1.33398H13.5218C13.5218 1.33398 13.5217 1.33398 13.5217 1.33398C12.4386 1.334 11.3799 1.66553 10.4851 2.28627C9.78582 2.77141 9.21195 3.41567 8.80767 4.16425C8.76617 4.25573 8.7274 4.3487 8.69143 4.44304L8.69142 4.44308L1.11783 24.3155L1.11779 24.3156C1.04554 24.5051 1.00811 24.6962 1.0013 24.8833C1.00084 24.8973 1.0005 24.9031 1.00028 24.9255C0.989145 25.8571 1.73449 26.6763 2.70792 26.6763H10.9216H10.9216C12.1903 26.6764 13.434 27.0275 14.5179 27.6908C15.6016 28.3539 16.4836 29.3034 17.0695 30.4352L17.0695 30.4353C17.5405 31.3455 18.2483 32.1065 19.115 32.6368C19.9816 33.1671 20.9744 33.4469 21.9858 33.4468H21.9859H27.7538C28.7933 33.4468 29.8145 33.1656 30.7114 32.6314C31.6083 32.0972 32.3487 31.3292 32.8545 30.406L32.8546 30.4059C33.4731 29.2776 34.38 28.3358 35.4822 27.6795C36.5844 27.0231 37.8413 26.6764 39.1222 26.6763H39.1222H47.2921C48.2663 26.6763 49.0121 25.8557 48.9997 24.9231Z"
                                fill="#7E808A"
                              ></path>
                              <path
                                id="Union_2"
                                opacity="0.3"
                                d="M2.52006 24.8497L2.52008 24.8496L10.0937 4.97726C10.3364 4.34056 10.7625 3.79752 11.3116 3.41661C11.8603 3.03594 12.5073 2.83399 13.1674 2.83398H36.8338C37.4939 2.83399 38.1409 3.03594 38.6896 3.41661C39.2387 3.79751 39.6648 4.34054 39.9075 4.97723C39.9075 4.97724 39.9075 4.97725 39.9075 4.97726L47.4812 24.8498L47.4812 24.8499C47.5499 25.03 47.4131 25.1763 47.2927 25.1763H39.1227C37.5708 25.1764 36.0489 25.5965 34.7153 26.3907C33.3818 27.1848 32.2862 28.3235 31.5397 29.6852L31.5397 29.6852C31.1618 30.3749 30.61 30.9462 29.9444 31.3426C29.279 31.7389 28.5229 31.9468 27.7544 31.9468H21.9863H21.9863C21.2521 31.9469 20.5301 31.7438 19.8985 31.3573C19.2667 30.9707 18.7481 30.4142 18.4022 29.7457L18.4022 29.7457C17.6913 28.3723 16.6199 27.2182 15.3014 26.4113C13.9826 25.6043 12.468 25.1764 10.9222 25.1763H2.70851C2.58826 25.1763 2.4513 25.03 2.52006 24.8497Z"
                                stroke="#7E808A"
                              ></path>
                            </g>
                          </g>
                        </svg>
                        <p className="mt-6 text-sm text-secondary max-sm:mt-2">
                          No data found
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Stats Grid */}
        <ul className="grid gap-4 whitespace-nowrap max-xl:grid-cols-2 max-sm:mt-16 max-sm:grid-cols-1 mt-20 grid-cols-3 max-md:mt-24 px-4">
          {/* Card 1: Total Agents (NFAs) */}
          <li className="rounded-2xl glass-card shadow-#1 overflow-hidden">
            <div className="flex items-center p-5 pb-3">
              <div className="mr-3 rounded-full p-2.5 text-[#6fa0ff] bg-[#0241ff]/10">
                <Cpu />
              </div>
              <div>
                <h4 className="text-sm text-secondary">Total Agents (NFAs)</h4>
                <div className="whitespace-nowrap text-lg font-medium">
                  {loading ? "..." : stats.totalAgents.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="m-2 rounded-lg p-3 text-sm">
              <p className="text-secondary">Network Status</p>
              <div className="mt-1 font-medium text-emerald-400">
                Live & Syncing
              </div>
              <div
                className="my-3"
                style={{
                  height: "1px",
                  backgroundImage:
                    "linear-gradient(to right, var(--dashed-border-color) 4px, transparent 3px)",
                  backgroundSize: "10px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              ></div>
              <div className="flex justify-between">
                <div>
                  <p className="text-secondary">Active Loops</p>
                  <div className="mt-1 font-medium">
                    {loading ? "..." : stats.totalActive.toLocaleString()}
                  </div>
                </div>
                <div>
                  <p className="text-secondary">Paused / Killed</p>
                  <div className="mt-1 font-medium">
                    {loading ? "..." : stats.totalPaused.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Card 2: Autonomous Operations */}
          <li className="rounded-2xl glass-card shadow-#1 overflow-hidden">
            <div className="flex items-center p-5 pb-3">
              <div className="mr-3 rounded-full p-2.5 text-[#6fa0ff] bg-[#0241ff]/10">
                <Activity />
              </div>
              <div>
                <h4 className="text-sm text-secondary">
                  Autonomous Operations
                </h4>
                <div className="whitespace-nowrap text-lg font-medium">
                  {loading ? "..." : stats.totalActions.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="m-2 rounded-lg p-3 text-sm">
              <p className="text-secondary">Avg. Operation Latency</p>
              <div className="mt-1 font-medium">~1.5s</div>
              <div
                className="my-3"
                style={{
                  height: "1px",
                  backgroundImage:
                    "linear-gradient(to right, var(--dashed-border-color) 4px, transparent 3px)",
                  backgroundSize: "10px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              ></div>
              <div className="flex justify-between">
                <div>
                  <p className="text-secondary">Total Volume</p>
                  <div className="mt-1 font-medium font-mono text-xs">
                    {loading
                      ? "..."
                      : `${totalVolumeSui.toLocaleString(undefined, { maximumFractionDigits: 2 })} SUI`}
                  </div>
                </div>
                <div>
                  <p className="text-secondary">Avg. Gas Sync</p>
                  <div className="mt-1 font-medium">0.0009 SUI</div>
                </div>
              </div>
            </div>
          </li>

          {/* Card 3: Skill Storage */}
          <li className="rounded-2xl glass-card shadow-#1 overflow-hidden">
            <div className="flex items-center p-5 pb-3">
              <div className="mr-3 rounded-full p-2.5 text-[#6fa0ff] bg-[#0241ff]/10">
                <Database />
              </div>
              <div>
                <h4 className="text-sm text-secondary">
                  Walrus Skill Registry
                </h4>
                <div className="text-lg font-medium">
                  {loading ? "..." : `${stats.totalAgents} Blobs`}
                </div>
              </div>
            </div>
            <div className="m-2 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-secondary">Storage Model</p>
                  <div className="mt-1 font-medium">Decentralized</div>
                </div>
                <div>
                  <p className="text-secondary">Indexer Rate</p>
                  <div className="mt-1 font-medium text-emerald-400">
                    100% (Sync)
                  </div>
                </div>
              </div>
              <div
                className="my-3"
                style={{
                  height: "1px",
                  backgroundImage:
                    "linear-gradient(to right, var(--dashed-border-color) 4px, transparent 3px)",
                  backgroundSize: "10px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              ></div>
              <div className="flex justify-between">
                <div>
                  <p className="text-secondary">Blob Ingest Rate</p>
                  <div className="mt-1 font-medium">9.2 / Min</div>
                </div>
                <div>
                  <p className="text-secondary">Query Speed</p>
                  <div className="mt-1 font-medium">120ms</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Hero;
