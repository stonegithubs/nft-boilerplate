import { Typography, Box, Button } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { injected, walletConnect } from "../lib/connectors";
import { useInactiveListener } from "../hooks/useInactiveListener";

export default function Home() {
  const context = useWeb3React();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;

  return (
    <Box>
      <Button onClick={() => activate(injected)}>Metamask</Button>
      <Button onClick={() => activate(walletConnect)}>WalletConnect</Button>
    </Box>
  );
}
