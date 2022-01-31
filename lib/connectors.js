import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const RPC_URLS = {
  1: process.env.NEXT_PUBLIC_RPC_URL_1,
  4: process.env.NEXT_PUBLIC_RPC_URL_4,
  31337: "http://localhost:8545",
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 4, 31337],
});

export const walletConnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  qrcode: true,
});

export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 31337,
});
