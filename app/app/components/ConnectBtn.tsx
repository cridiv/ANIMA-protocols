import {
  useConnectWallet,
  useCurrentAccount,
  useWallets,
} from "@mysten/dapp-kit";
import { isEnokiWallet, AuthProvider } from "@mysten/enoki";
import { type EnokiWallet } from "@mysten/enoki";

function ConnectBtn() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: connect } = useConnectWallet();

  const wallets = useWallets().filter(isEnokiWallet);
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  const googleWallet = walletsByProvider.get("google");

  if (currentAccount) {
    return <div>Current address: {currentAccount.address}</div>;
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
                console.error("Enoki Errors:", JSON.stringify(err.errors, null, 2));
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

