import { Box, ThemeProvider, Container, Typography } from "@mui/material";
import Head from "next/head";
import theme from "../theme";
import Header from "../components/Header";

export default function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Head></Head>
      <Header />
      <Container>{children}</Container>
      <Box>
        <Typography>Footer</Typography>
      </Box>
    </ThemeProvider>
  );
}
