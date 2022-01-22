import { createTheme } from "@mui/material";

const Theme = createTheme({
  typography: {
    fontFamily: "Homemade Apple, Arial",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
          @font-face {
            font-family: 'Raleway';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
          }
        `,
    },
  },
});

export default Theme;
