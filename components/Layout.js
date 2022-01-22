import { Box, ThemeProvider, Container, Typography } from "@mui/material";
import Head from "next/head";
import theme from "../theme";
import Header from "../components/Header";

export default function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap');
        </style>
      </Head>
      {/* <Header /> */}
      <Box
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
