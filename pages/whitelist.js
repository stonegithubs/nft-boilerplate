import { Stack, Grid, Typography, Box, Button } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { injected, walletConnect } from "../lib/connectors";
import { useInactiveListener } from "../hooks/useInactiveListener";
import useContract from "../hooks/useContract";
import Image from "next/image";
import { sup } from "../lib/supabase-client";

export default function Whitelist() {
  const context = useWeb3React();
  const enableMint = false;

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

  const discord = async () => {
    const { user, session, error } = await sup.auth.signIn({
      provider: "discord",
    });
  };

  return (
    <Box
      display={"flex"}
      height="100vh"
      alignItems={"center"}
      alignContent={"center"}
      justifyContent={"center"}
    >
      <Stack minWidth={300} spacing={2}>
        <Typography>Join Daydreams Whitelist</Typography>
        <Button variant="contained" onClick={() => activate(injected)}>
          Connect Wallet
        </Button>
        <Button variant="contained" onClick={discord}>
          Verify Discord
        </Button>
      </Stack>
    </Box>
  );
}
