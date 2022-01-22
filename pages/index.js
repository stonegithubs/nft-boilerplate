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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {/* {!active && (
        <>
          <Button onClick={() => activate(injected)}>Metamask</Button>
          <Button onClick={() => activate(walletConnect)}>WalletConnect</Button>
        </>
      )} */}
      <Image src="/taisei.png" width={800} height={800} />
      {/* {active && <Button onClick={mint}>Mint</Button>} */}
    </Box>
  );
}
