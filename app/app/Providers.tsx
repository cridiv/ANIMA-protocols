"use client";

import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useSuiClientContext,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerEnokiWallets } from "@mysten/enoki";
import { EnokiFlowProvider } from "@mysten/enoki/react";
import { ReactNode, useEffect } from "react";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  testnet: {
    url: "https://fullnode.testnet.sui.io:443",
    network: "testnet",
  },
});

const queryClient = new QueryClient();

// This component handles the registration of Google/Twitch as "Wallets"
function EnokiWalletWrapper() {
  const { client } = useSuiClientContext();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!apiKey || !googleClientId) return;

    // This registers "Google" as a wallet option in the Connect Modal
    const { unregister } = registerEnokiWallets({
      apiKey,
      providers: {
        google: {
          clientId: googleClientId,
          redirectUrl: window.location.origin,
        },
      },
      client,
      network: "testnet",
    });

    return unregister;
  }, [client]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <EnokiFlowProvider apiKey={process.env.NEXT_PUBLIC_ENOKI_API_KEY!}>
          {/* 1. Register Enoki Wallets first */}
          <EnokiWalletWrapper />

          {/* 2. Then load the Wallet Provider (which will now see Google as a wallet) */}
          <WalletProvider autoConnect>{children}</WalletProvider>
        </EnokiFlowProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
