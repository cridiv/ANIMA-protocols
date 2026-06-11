"use client";

import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { label: "Blog", href: "https://example.com/blog", external: true },
    {
      label: "Whitepaper",
      href: "https://example.com/whitepaper",
      external: true,
    },
    { label: "Docs", href: "https://example.com/docs", external: true },
    { label: "GitHub", href: "https://github.com", external: true },
    { label: "Press", href: "https://example.com/press", external: true },
  ];

  const socialLinks = [
    {
      label: "Discord",
      href: "https://discord.gg",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M20.317 4.493c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.607 1.23a18.566 18.566 0 0 0-5.488 0 12.358 12.358 0 0 0-.617-1.23.077.077 0 0 0-.079-.038c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.094-.32 13.556.1 17.962a.08.08 0 0 0 .031.055 20.031 20.031 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.463-.619.873-1.276 1.226-1.963a.074.074 0 0 0-.04-.104 13.211 13.211 0 0 1-1.873-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.076.076 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .08.009c.12.098.244.195.371.288a.075.075 0 0 1 .02.1.076.076 0 0 1-.026.025c-.598.344-1.22.635-1.872.877a.075.075 0 0 0-.041.105c.36.687.771 1.341 1.224 1.962a.078.078 0 0 0 .084.028 19.966 19.966 0 0 0 6.003-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.55-13.442a.06.06 0 0 0-.03-.028ZM8.02 15.279c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.177 1.077 2.158 2.38 0 1.312-.957 2.38-2.158 2.38Zm7.976 0c-1.184 0-2.158-1.069-2.158-2.38 0-1.312.956-2.38 2.158-2.38 1.21 0 2.176 1.077 2.156 2.38 0 1.312-.946 2.38-2.157 2.38Z"
          ></path>
        </svg>
      ),
    },
    {
      label: "Twitter",
      href: "https://twitter.com",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M7.548 21c9.056 0 14.01-6.926 14.01-12.932 0-.196 0-.392-.015-.587A9.63 9.63 0 0 0 24 5.128c-.899.368-1.852.609-2.828.715 1.028-.568 1.797-1.461 2.165-2.514-.967.53-2.024.903-3.127 1.104a5.068 5.068 0 0 0-2.794-1.373 5.288 5.288 0 0 0-3.122.478 4.72 4.72 0 0 0-2.163 2.133 4.229 4.229 0 0 0-.312 2.907 14.904 14.904 0 0 1-5.622-1.379A13.833 13.833 0 0 1 1.67 3.83c-.63 1-.822 2.185-.539 3.312.283 1.128 1.021 2.113 2.064 2.755A5.195 5.195 0 0 1 .96 9.327v.058c0 1.05.394 2.066 1.114 2.878A5.012 5.012 0 0 0 4.91 13.84a5.314 5.314 0 0 1-2.223.078 4.582 4.582 0 0 0 1.752 2.259c.825.566 1.82.88 2.848.898a10.21 10.21 0 0 1-3.44 1.611c-1.25.323-2.558.416-3.847.272C2.252 20.292 4.872 21 7.548 20.997"
          ></path>
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19.62 2H4.38A2.38 2.38 0 0 0 2 4.38v15.24A2.38 2.38 0 0 0 4.38 22h15.24A2.38 2.38 0 0 0 22 19.62V4.38A2.38 2.38 0 0 0 19.62 2ZM8.188 9.62v9.047H5.333V9.619H8.19ZM5.333 6.984c0-.666.571-1.177 1.428-1.177s1.395.51 1.428 1.177c0 .666-.533 1.204-1.428 1.204-.857 0-1.428-.538-1.428-1.204Zm13.334 11.682H15.81v-4.762c0-.952-.478-1.905-1.67-1.925h-.037c-1.151 0-1.629.983-1.629 1.925v4.762H9.62V9.619h2.856v1.22s.92-1.22 2.768-1.22c1.89 0 3.424 1.3 3.424 3.934v5.114Z"
          ></path>
        </svg>
      ),
    },
  ];

  const legalLinks = [
    { label: "Terms & Conditions", href: "https://example.com/terms" },
    { label: "Privacy Policy", href: "https://example.com/privacy" },
  ];

  return (
    <footer className="bg-[#6fa0ff]/40 px-5 py-10 md:px-10 md:py-14">
      <nav className="flex flex-col justify-center gap-4 divide-y divide-solid divide-gray-45 md:gap-7.5">
        <div className="flex flex-col-reverse items-center gap-7.5 md:flex-row md:justify-between">
          {/* Logo - Hidden on mobile */}
          <div className="hidden self-center md:flex md:self-start">
            <svg
              width="111"
              height="20"
              viewBox="0 0 111 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.62397 19.3842C5.31197 19.3842 4.05597 19.2002 2.85597 18.8322C1.65597 18.4482 0.703969 17.9602 -3.05176e-05 17.3682L1.07997 14.9442C1.75197 15.4722 2.58397 15.9122 3.57597 16.2642C4.56797 16.6162 5.58397 16.7922 6.62397 16.7922C7.50397 16.7922 8.21597 16.6962 8.75997 16.5042C9.30397 16.3122 9.70397 16.0562 9.95997 15.7362C10.216 15.4002 10.344 15.0242 10.344 14.6082C10.344 14.0962 10.16 13.6882 9.79197 13.3842C9.42397 13.0642 8.94397 12.8162 8.35197 12.6402C7.77597 12.4482 7.12797 12.2722 6.40797 12.1122C5.70397 11.9522 4.99197 11.7682 4.27197 11.5602C3.56797 11.3362 2.91997 11.0562 2.32797 10.7202C1.75197 10.3682 1.27997 9.90421 0.911969 9.32821C0.543969 8.75221 0.359969 8.01621 0.359969 7.12021C0.359969 6.20821 0.599969 5.37621 1.07997 4.62421C1.57597 3.85621 2.31997 3.24821 3.31197 2.80021C4.31997 2.33621 5.59197 2.10421 7.12797 2.10421C8.13597 2.10421 9.13597 2.23221 10.128 2.48821C11.12 2.74421 11.984 3.11221 12.72 3.59221L11.736 6.01621C10.984 5.56821 10.208 5.24021 9.40797 5.03221C8.60797 4.80821 7.83997 4.69621 7.10397 4.69621C6.23997 4.69621 5.53597 4.80021 4.99197 5.00821C4.46397 5.21621 4.07197 5.48821 3.81597 5.82421C3.57597 6.16021 3.45597 6.54421 3.45597 6.97621C3.45597 7.48821 3.63197 7.90421 3.98397 8.22421C4.35197 8.52821 4.82397 8.76821 5.39997 8.94421C5.99197 9.12021 6.64797 9.29621 7.36797 9.47221C8.08797 9.63221 8.79997 9.81621 9.50397 10.0242C10.224 10.2322 10.872 10.5042 11.448 10.8402C12.04 11.1762 12.512 11.6322 12.864 12.2082C13.232 12.7842 13.416 13.5122 13.416 14.3922C13.416 15.2882 13.168 16.1202 12.672 16.8882C12.192 17.6402 11.448 18.2482 10.44 18.7122C9.43197 19.1602 8.15997 19.3842 6.62397 19.3842Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>

          {/* Navigation Links and Social Media */}
          <div>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-end">
              {/* Main Navigation Links */}
              <ul className="flex gap-4 md:flex-row md:gap-6">
                {navigationLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noreferrer noopener" : undefined}
                      className="text-body font-semibold text-steel-dark hover:text-steel-darker active:text-steel transition-colors"
                    >
                      <div className="flex-nowrap items-center gap-2 inline-flex">
                        <div className="break-words text-body font-medium text-steel-darker">
                          {link.label}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Social Media Links */}
              <ul className="flex justify-center gap-6">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-body font-semibold text-steel-dark hover:text-steel-darker active:text-steel transition-colors"
                      aria-label={social.label}
                    >
                      <div className="flex-nowrap items-center gap-2 inline-flex">
                        <div className="mt-2">
                          <div className="flex items-center text-steel-darker text-lg">
                            {social.icon}
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="flex flex-col-reverse justify-center gap-3 pt-3 md:flex-row md:justify-between">
          <div className="flex justify-center md:justify-start">
            <div className="break-words text-sm font-medium text-steel-darker">
              ©{currentYear} ANIMA Protocol. All rights reserved.
            </div>
          </div>

          <ul className="flex flex-col gap-3 md:flex-row md:gap-8">
            {legalLinks.map((link) => (
              <li key={link.label} className="flex items-center justify-center">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-body font-semibold text-steel-dark hover:text-steel-darker active:text-steel transition-colors"
                >
                  <div className="flex-nowrap items-center gap-2 inline-flex">
                    <div className="break-words text-sm font-medium text-steel-darker">
                      {link.label}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Logo */}
      <div className="mt-4 flex justify-center border-t border-solid border-gray-45 pt-5 md:hidden">
        <svg
          width="111"
          height="20"
          viewBox="0 0 111 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.62397 19.3842C5.31197 19.3842 4.05597 19.2002 2.85597 18.8322C1.65597 18.4482 0.703969 17.9602 -3.05176e-05 17.3682L1.07997 14.9442C1.75197 15.4722 2.58397 15.9122 3.57597 16.2642C4.56797 16.6162 5.58397 16.7922 6.62397 16.7922C7.50397 16.7922 8.21597 16.6962 8.75997 16.5042C9.30397 16.3122 9.70397 16.0562 9.95997 15.7362C10.216 15.4002 10.344 15.0242 10.344 14.6082C10.344 14.0962 10.16 13.6882 9.79197 13.3842C9.42397 13.0642 8.94397 12.8162 8.35197 12.6402C7.77597 12.4482 7.12797 12.2722 6.40797 12.1122C5.70397 11.9522 4.99197 11.7682 4.27197 11.5602C3.56797 11.3362 2.91997 11.0562 2.32797 10.7202C1.75197 10.3682 1.27997 9.90421 0.911969 9.32821C0.543969 8.75221 0.359969 8.01621 0.359969 7.12021C0.359969 6.20821 0.599969 5.37621 1.07997 4.62421C1.57597 3.85621 2.31997 3.24821 3.31197 2.80021C4.31997 2.33621 5.59197 2.10421 7.12797 2.10421C8.13597 2.10421 9.13597 2.23221 10.128 2.48821C11.12 2.74421 11.984 3.11221 12.72 3.59221L11.736 6.01621C10.984 5.56821 10.208 5.24021 9.40797 5.03221C8.60797 4.80821 7.83997 4.69621 7.10397 4.69621C6.23997 4.69621 5.53597 4.80021 4.99197 5.00821C4.46397 5.21621 4.07197 5.48821 3.81597 5.82421C3.57597 6.16021 3.45597 6.54421 3.45597 6.97621C3.45597 7.48821 3.63197 7.90421 3.98397 8.22421C4.35197 8.52821 4.82397 8.76821 5.39997 8.94421C5.99197 9.12021 6.64797 9.29621 7.36797 9.47221C8.08797 9.63221 8.79997 9.81621 9.50397 10.0242C10.224 10.2322 10.872 10.5042 11.448 10.8402C12.04 11.1762 12.512 11.6322 12.864 12.2082C13.232 12.7842 13.416 13.5122 13.416 14.3922C13.416 15.2882 13.168 16.1202 12.672 16.8882C12.192 17.6402 11.448 18.2482 10.44 18.7122C9.43197 19.1602 8.15997 19.3842 6.62397 19.3842Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;
