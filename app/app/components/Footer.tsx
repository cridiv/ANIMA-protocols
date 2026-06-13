import React from "react";
import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full pb-6 md:pb-12 lg:pb-14 xl:pb-16">
      <div className="container mx-auto">
        <div className="w-full border-t border-[#E9E9E9] pt-6 pb-2.5 md:pt-8 md:pb-3 lg:pt-9 lg:pb-4 xl:pt-10 xl:pb-5">
          {/* Bottom Info Section */}
          <div className="w-full flex justify-between font-rm text-[#6F6F6F] px-4 flex-col md:flex-row items-center gap-2 text-xs md:gap-3 md:text-sm">
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
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

              <span>© ANIMA Protocol.</span>
              <span>2026</span>
              <span>All Rights Reserved</span>
            </div>

            <div className="flex items-center gap-2 md:gap-5">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-[10px] md:text-xs text-center hover:text-[#0241ff] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-[10px] md:text-xs text-center hover:text-[#0241ff] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-[10px] md:text-xs text-center hover:text-[#0241ff] transition-colors"
              >
                License
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
