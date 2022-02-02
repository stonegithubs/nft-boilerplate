//@ts-check
import { Stack, Typography, Box, Button } from "@mui/material";
import Loading from "../components/Loader";
import axios from "axios";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";
import { useWeb3React } from "@web3-react/core";
import { network, injected, walletConnect } from "../lib/connectors";
import { useInactiveListener } from "../hooks/useInactiveListener";
import useContract from "../hooks/useContract";
import Daydreams from "../contracts/Daydreams.json";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contracts from "../contracts/contract-address.json";

// const contract = useContract(
//   process.env.NEXT_PUBLIC_MINT_CONTRACT_ADDRESS,
//   tokenMeta.abi
// );

const MINT_ACTIVE = true; //process.env.NEXT_PUBLIC_MINT_ACTIVE;

export default function Home() {
  const context = useWeb3React();
  const [s, setMintState] = useState({});
  const [wlState, setWLState] = useState({});
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error: connectError,
  } = context;

  const dd = useContract(contracts.Daydreams, Daydreams.abi);

  useEffect(() => {
    activate(network);
  }, []);

  useEffect(() => {
    const fn = async () => {
      try {
        const { data } = await axios.get(`/api/vip/${account}`);
        setWLState(data);
      } catch (e) {
        console.error(e);
      }
    };

    if (account && s.phase === 1) {
      fn();
    }
  }, [account, s.phase]);

  useEffect(() => {
    const fn = async () => {
      setLoading(true);
      setError(null);
      try {
        const phase = await dd.phase();
        const numSold = await dd.totalSupply();
        const total = await dd.total();
        const marketingSupply = await dd.reservedSupply();

        setMintState({
          numSold: numSold.toNumber(),
          total: total.toNumber(),
          marketingSupply,
          phase,
        });
      } catch (e) {
        setError(tryParseReason(e));
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (active && !account) {
      fn();
    }
  }, [chainId, active]);

  const tryParseReason = (err) => {
    const res = err.data?.message?.match(
      /.*reverted with reason.*'(?<reason>.*)'$/
    );
    return res?.groups?.reason || "Unknown Error";
  };

  const wlMint = async () => {
    setLoading(true);
    setError(null);

    const qty = 2;

    try {
      const tx = await dd.whitelistMint(
        qty,
        wlState.proof.map((i) => ethers.utils.hexZeroPad(i, 32)),
        {
          value: ethers.utils.parseEther(
            `${process.env.NEXT_PUBLIC_WL_PRICE * qty}`
          ),
        }
      );

      const res = await tx.wait();
      console.log(res);
    } catch (e) {
      setError(tryParseReason(e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
        Daydreams
      </Typography>
      {error && <Typography>{error}</Typography>}
      {(() => {
        if (loading) {
          return (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Loading />
            </Box>
          );
        }

        if (!MINT_ACTIVE) {
          return <InactiveMint />;
        }

        if (!active) {
          return <Typography>Loading</Typography>;
        }

        if (s.isSoldOut) {
          return <Box>Sold Out</Box>;
        }

        if (s.phase == 0) {
          return <InactiveMint />;
        }

        if (s.phase > 0 && !account) {
          return (
            <Box>
              <MintsRemaining {...s} />
              <Connect />
            </Box>
          );
        }

        if (s.phase === 1) {
          return (
            <Box>
              {/* whitelist mint check on account */}
              <Typography>{account}</Typography>
              {/* todo: loading */}
              {wlState.valid && (
                <Button variant="contained" onClick={wlMint}>
                  {" "}
                  Whitelist Mint
                </Button>
              )}
              {!wlState.valid && (
                <Typography>You are not on the whitelist</Typography>
              )}
            </Box>
          );
        }

        if (s.phase === 2) {
          return (
            <Box>
              {/* whitelist mint check on account */}
              <Typography>{account}</Typography>
              <Button variant="contained"> Mint</Button>
            </Box>
          );
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

const MintsRemaining = ({ total, numSold }) => (
  <Typography component="div">{total - numSold} Remaining</Typography>
);

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
