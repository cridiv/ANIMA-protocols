import {
  useConnectWallet,
  useCurrentAccount,
  useWallets,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { isEnokiWallet, AuthProvider } from "@mysten/enoki";
import { type EnokiWallet } from "@mysten/enoki";
import { LogOut } from "lucide-react";

function ConnectBtn() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();

  const wallets = useWallets().filter(isEnokiWallet);
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  const googleWallet = walletsByProvider.get("google");

  if (currentAccount) {
    return (
      <div className="flex items-center gap-2.5 bg-[#0241ff] border border-[#0241ff]/15 rounded-full px-4 py-1.5 shadow-sm font-mono shrink-0">
        {/* Pulsing connected indicator */}
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="text-xs text-white font-medium select-all">
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
    );
  }

  return (
    <>
      {googleWallet ? (
        <button
          className="w-full primary-button inline-flex items-center justify-center gap-2 rounded-full cursor-pointer hover:scale-95 px-5 py-3 text-sm font-medium text-white transition-all hover:shadow-lg mt-2"
          onClick={async () => {
            try {
              await connect({ wallet: googleWallet });
            } catch (err: any) {
              console.error("Connect error:", err);
              if (err.errors) {
                console.error(
                  "Enoki Errors:",
                  JSON.stringify(err.errors, null, 2),
                );
              }
            }
          }}
        >
          Sign in with Google
        </button>
      ) : null}
    </>
  );
}

export default ConnectBtn;
