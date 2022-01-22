import { Box, ThemeProvider, Container, Typography } from "@mui/material";
import Head from "next/head";
import theme from "../theme";
import Header from "../components/Header";

export default function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Head></Head>
      {/* <Header /> */}
      <Box
        sx={{
          animation: "bgcolor 60s infinite",
        }}
        // maxWidth={"lg"}
      >
        {children}
      </Box>
      {/* <Box>
        <Typography>Footer</Typography>
      </Box> */}
    </ThemeProvider>
  );
}
