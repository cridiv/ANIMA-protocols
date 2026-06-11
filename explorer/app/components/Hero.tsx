"use client";

import { Box, Coins, Hourglass, Search } from "lucide-react";
import React, { useState } from "react";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="py-12">
      <div className="relative z-10">
        {/* Title */}
        <h1 className="mt-12 text-center text-4xl font-bold max-sm:mt-8 max-sm:text-2xl">
          Explore Sui Blockchain
        </h1>

        {/* Search Bar */}
        <div className="relative z-50 mx-auto mt-8 max-w-[730px] max-md:hidden max-md:w-full max-sm:px-4">
          <div style={{ height: "56px" }}>
            <div className="relative rounded-full">
              <input
                type="text"
                placeholder="Search by Account, Package, Object, Transaction, SuiNS"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-body p-4 text-sm shadow-#1 backdrop-blur-sm placeholder:font-normal placeholder:text-secondary h-[56px] pr-[128px] dark:border dark:font-[400] dark:backdrop-blur-[5px] focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <span
                className="absolute flex h-7 w-7 items-center justify-center rounded-md bg-brand-secondary text-brand max-sm:hidden top-1/2 -translate-y-1/2 transform"
                style={{ right: "90px" }}
              >
                /
              </span>
              <button className="absolute right-1 top-1 flex items-center justify-center rounded-full bg-brand h-12 w-[76px] hover:opacity-90 transition-opacity">
                <Search />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <ul className="grid gap-4 whitespace-nowrap max-xl:grid-cols-2 max-sm:mt-16 max-sm:grid-cols-1 mt-20 grid-cols-3 max-md:mt-24 px-4">
          {/* Card 1: Total Txn Block */}
          <li className="rounded-2xl bg-body shadow-#1 dark:border overflow-hidden">
            <div className="flex items-center p-5 pb-3">
              <div className="mr-3 rounded-full border p-2.5">
                <Box />
              </div>
              <div>
                <h4 className="text-sm text-secondary">Total Txn Block</h4>
                <div className="whitespace-nowrap text-lg font-medium">
                  3.61B
                </div>
              </div>
            </div>
            <div className="m-2 rounded-lg border bg-secondary p-3 text-sm">
              <p className="text-secondary">Total Supply</p>
              <div className="mt-1 font-medium">10B</div>
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
                  <p className="text-secondary">TPS (Peak)</p>
                  <div className="mt-1 font-medium">36 (59)</div>
                </div>
                <div>
                  <p className="text-secondary">CPS (Peak)</p>
                  <div className="mt-1 font-medium">59 (404)</div>
                </div>
              </div>
            </div>
          </li>

          {/* Card 2: Total Stake */}
          <li className="rounded-2xl bg-body shadow-#1 dark:border overflow-hidden">
            <div className="flex items-center p-5 pb-3">
              <div className="mr-3 rounded-full border p-2.5">
                <Coins />
              </div>
              <div>
                <h4 className="text-sm text-secondary">Total Stake</h4>
                <div className="whitespace-nowrap text-lg font-medium">
                  <span className="overflow-hidden whitespace-nowrap leading-none inline">
                    6.83B
                  </span>{" "}
                  <span className="text-sm font-normal text-secondary">
                    SUI
                  </span>
                  <span className="mx-1 font-normal text-secondary">|</span>116{" "}
                  <span className="text-sm font-normal text-secondary">
                    Validators
                  </span>
                </div>
              </div>
            </div>
            <div className="m-2 rounded-lg border bg-secondary p-3 text-sm">
              <p className="text-secondary">Last Epoch Rewards</p>
              <div className="mt-1 font-medium">
                <span className="overflow-hidden whitespace-nowrap leading-none inline">
                  20.9K
                </span>
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
                  <p className="text-secondary">Total Reward</p>
                  <div className="mt-1 font-medium">
                    <span className="inline-block overflow-hidden whitespace-nowrap leading-none">
                      1.33B
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-secondary">Staking APY</p>
                  <div className="mt-1 font-medium">0.11%</div>
                </div>
              </div>
            </div>
          </li>

          {/* Card 3: Epoch */}
          <li className="rounded-2xl bg-body shadow-#1 dark:border overflow-hidden">
            <div className="flex items-center p-5 pb-3">
              <div className="mr-3 rounded-full border p-2.5">
                <Hourglass />
              </div>
              <div>
                <h4 className="text-sm text-secondary">Epoch</h4>
                <div className="text-lg font-medium">1,127</div>
              </div>
              <div className="w-full ml-4">
                <div
                  className="ml-auto mt-1 flex h-2 max-w-[100px] overflow-hidden rounded-full bg-inactive"
                  role="progressbar"
                  aria-valuenow={15}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="flex flex-col justify-center overflow-hidden whitespace-nowrap rounded-full bg-brand text-center text-xs transition duration-500"
                    style={{ width: "15%" }}
                  ></div>
                </div>
                <div className="mt-4 flex justify-end text-sm text-secondary">
                  15%
                </div>
              </div>
            </div>
            <div className="m-2 rounded-lg border bg-secondary p-3 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-secondary">Started at</p>
                  <div className="mt-1 font-medium">
                    <div>Jun 10, 2026 10:24</div>
                  </div>
                </div>
                <div className="w-[90px] whitespace-nowrap">
                  <p className="text-secondary">Time Remain</p>
                  <div className="mt-1 font-medium">20h 23m left</div>
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
                  <p className="text-secondary">Checkpoint</p>
                  <div className="mt-1 font-medium">346,926,614</div>
                </div>
                <div className="w-[90px] whitespace-nowrap">
                  <p className="text-secondary">Avg Gas Fee</p>
                  <div className="mt-1 font-medium">
                    <span>0.00022 SUI</span>
                  </div>
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
