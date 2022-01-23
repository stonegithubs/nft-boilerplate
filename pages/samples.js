import { Grid, Typography, Box, Button } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { injected, walletConnect } from "../lib/connectors";
import { useInactiveListener } from "../hooks/useInactiveListener";
import useContract from "../hooks/useContract";
// import NFT from "../contracts/NFT.json";
import Image from "next/image";

// const contract = useContract(
//   process.env.NEXT_PUBLIC_MINT_CONTRACT_ADDRESS,
//   tokenMeta.abi
// );

export default function Home() {
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

  /**
   * states
   * - sold out
   * - available
   */
  let out = [];
  for (let i = 0; i <= 250; i++) {
    out.push(i);
  }

  return (
    <Box>
      <Typography
        fontSize={{ xs: 32, sm: 32, md: 32 }}
        textAlign="center"
        sx={{ mt: 5, p: 2, pb: 3 }}
      >
        Daydreams
      </Typography>
      <Grid container spacing={2} alignItems="center" justifyContent={"center"}>
        {out.map((i) => (
          <Grid item>
            <Image src={`/samples/${i}.png`} width={250} height={250} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
