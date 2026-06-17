"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="w-full min-h-screen flex flex-col overflow-hidden relative z-10 pointer-events-none pt-12 pb-18 md:pt-20 md:pb-30">
      <div className="flex-grow w-full mx-auto flex flex-col items-center justify-center px-4 max-w-[520px] md:max-w-[680px] lg:max-w-[880px]">
        {/* Badge */}
        {/* <div className="flex items-center gap-2 bg-blue-50 py-1 pl-4 pr-3 rounded-full text-sm font-[500] uppercase md:py-2 md:pl-6 md:pr-4 md:text-base after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-500">
          ANIMA Protocol
        </div> */}

        {/* Main Heading */}
        <h1 className="leading-1.4 text-center tracking-[-0.03em] mt-6 text-[32px] font-[500] md:text-[64px] md:font-[400] md:mt-10 md:leading-0.8 lg:text-[72px] xl:text-[80px]">
          Agent Native Identity & Machine Autonomy{" "}
        </h1>

        {/* Description */}
        <div className="text-[#4C4C4C] text-center !leading-1.4 tracking-[-0.03em] mt-4 text-md md:max-w-[600px] md:text-lg md:mt-6 lg:mt-6 lg:text-xl">
          <h2>
            Giving AI agents a soul on-chain. First-class agent identity,
            accountability, and autonomy on Sui.
          </h2>
        </div>

        {/* CTA Buttons */}
        <div className="pointer-events-auto w-fit flex flex-col items-center justify-center gap-2 mt-8 mb-10 md:flex-row md:gap-5 md:w-full">
          <Link className="w-full md:w-fit" href="/mint">
            <button className="w-full primary-button inline-flex items-center justify-center gap-2 rounded-full cursor-pointer hover:scale-95 text-lg font-lg h-12 px-6 py-2 text-sm md:h-10 md:px-4 md:py-2.5 md:text-sm lg:h-11 lg:px-5 lg:py-3 xl:h-12 xl:px-6 xl:py-3.5 text-white transition-all hover:shadow-lg mt-2">
              Mint your Agent
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>

          <Link className="pointer-events-auto" href="/#features">
            <button className="w-full secondary-button inline-flex items-center justify-center gap-2 rounded-full cursor-pointer hover:scale-95 text-lg font-lg h-12 px-6 py-2 text-sm md:h-10 md:px-4 md:py-2.5 md:text-sm lg:h-11 lg:px-5 lg:py-3 xl:h-12 xl:px-6 xl:py-3.5 text-black transition-all hover:shadow-lg mt-2">
              Learn More
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
