import { Typography, Box, Button } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { injected, walletConnect } from "../lib/connectors";
// import { useInactiveListener } from "../hooks/useInactiveListener";
// import useContract from "../hooks/useContract";
// import Medallions from "../contracts/Medallions.json";
import Image from "next/image";

export default function Home() {
  const context = useWeb3React();
  // const contract = useContract(
  //   process.env.NEXT_PUBLIC_MINT_CONTRACT_ADDRESS,
  //   tokenMeta.abi
  // );

  // const {
  //   connector,
  //   library,
  //   chainId,
  //   account,
  //   activate,
  //   deactivate,
  //   active,
  //   error,
  // } = context;

  // const mint = async () => {
  //   const balance = await contract.balanceOf(account);
  //   alert(balance);
  // };

  /**
   * states
   * - sold out
   * - available
   */

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
      {/* {!active && (
        <>
          <Button onClick={() => activate(injected)}>Metamask</Button>
          <Button onClick={() => activate(walletConnect)}>WalletConnect</Button>
        </>
      )} */}

      <img src="/taisei.png" style={{ height: "auto", width: "100%" }} />

      <Typography fontSize={{ xs: 32, sm: 42, md: 50 }} sx={{ mt: 5, pb: 0 }}>
        Dreamers
      </Typography>
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
}
