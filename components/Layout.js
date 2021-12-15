import { Box, ThemeProvider, Container, Typography } from "@mui/material";
import Head from "next/head";
import theme from "../theme";

export default function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Head></Head>
      <Box>
        <Typography>Header</Typography>
      </Box>
      <Container>{children}</Container>
      <Box>
        <Typography>Footer</Typography>
      </Box>
    </ThemeProvider>
  );
}
