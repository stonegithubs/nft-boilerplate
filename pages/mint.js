//@ts-check
import { Stack, Typography, Box, Button } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { network, injected, walletConnect } from "../lib/connectors";
import { useInactiveListener } from "../hooks/useInactiveListener";
import useContract from "../hooks/useContract";
import Daydreams from "../contracts/Daydreams.json";
import Image from "next/image";
import { useState, useEffect } from "react";
import contracts from "../contracts/contract-address.json";

// const contract = useContract(
//   process.env.NEXT_PUBLIC_MINT_CONTRACT_ADDRESS,
//   tokenMeta.abi
// );

const MINT_ACTIVE = true; //process.env.NEXT_PUBLIC_MINT_ACTIVE;

export default function Home() {
  const context = useWeb3React();
  const [phase, setPhase] = useState();
  const [isSoldOut, setIsSoldOut] = useState();

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

  const dd = useContract(contracts.Daydreams, Daydreams.abi);

  useEffect(() => {
    activate(network);
  }, []);

  useEffect(() => {
    const fn = async () => {
      const phase = await dd.phase();
      const numSold = await dd.totalSupply();
      const total = await dd.total();
      const marketingSupply = await dd.reservedSupply();

      setIsSoldOut(
        total.toNumber() - marketingSupply - numSold.toNumber() === 0
      );
      setPhase(phase);
    };

    if (active && !account) {
      fn();
    }
  }, [chainId, active]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        minWidth: 350,
      }}
    >
      <img src="/taisei.png" style={{ height: "auto", width: "100%" }} />

      <Typography fontSize={{ xs: 32, sm: 42, md: 50 }} sx={{ mt: 5, pb: 0 }}>
        Dreamers
      </Typography>
      {(() => {
        if (!MINT_ACTIVE) {
          return <InactiveMint />;
        }

        if (!active) {
          return <Typography>Loading</Typography>;
        }

        if (isSoldOut) {
          return <Box>Sold Out</Box>;
        }

        if (phase == 0) {
          return <InactiveMint />;
        }

        if (phase > 0 && !account) {
          return <Connect />;
        }

        if (phase === 1) {
          return <Box>{account} Whitelist Mint</Box>;
        }

        if (phase === 2) {
          return <Box>Public Mint</Box>;
        }
      })()}
    </Box>
  );
}

const Connect = () => {
  const { activate } = useWeb3React();
  return (
    <Stack spacing={1} direction={"row"} justifyContent={"center"}>
      <Button variant="contained" onClick={() => activate(injected)}>
        Metamask
      </Button>
      <Button variant="contained" onClick={() => activate(walletConnect)}>
        WalletConnect
      </Button>
    </Stack>
  );
};

const InactiveMint = () => (
  <Box>
    <Typography
      fontSize={{
        sm: 19,
        md: 20,
      }}
    >
      Minting 03/2022
    </Typography>
  </Box>
);
