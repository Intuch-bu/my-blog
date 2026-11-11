"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#20221f", dark: "#000000", contrastText: "#ffffff" },
    secondary: { main: "#aa3d20" },
    background: { default: "#f5f4ef", paper: "#faf9f5" },
    text: { primary: "#20221f", secondary: "#575a53" },
    divider: "#b9bbb1",
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: '"Inter", "Noto Sans Thai", Arial, sans-serif',
    h1: { fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif', fontWeight: 500, letterSpacing: "-0.04em" },
    h2: { fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif', fontWeight: 500, letterSpacing: "-0.03em" },
    h3: { fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif', fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 2, paddingInline: 20, minHeight: 40, fontWeight: 700 },
        outlined: { borderColor: "#55594e", color: "#20221f", "&:hover": { borderColor: "#20221f", backgroundColor: "#e5e6dc" } },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 2 }, outlined: { borderColor: "#b9bbb1" } } },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiChip: { styleOverrides: { root: { borderRadius: 2, fontWeight: 600 } } },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 2 } } },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider>;
}
