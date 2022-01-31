import { createTheme } from "@mui/material";

const Theme = createTheme({
  typography: {
    fontFamily: "Arial",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
          @font-face {
            font-family: 'Homemade Apple';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
          }
        `,
    },
  },
});

export default Theme;
