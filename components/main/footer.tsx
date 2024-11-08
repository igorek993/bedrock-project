"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#21b3d8",
    },
  },
  typography: {
    button: {
      textTransform: "none",
      fontWeight: "bold",
    },
  },
});

const Footer = () => {
  return (
    <div className="flex flex-col sm:flex-row bg-navbar justify-between items-center p-3">
      <ThemeProvider theme={customTheme}>
        <Button
          color="primary"
          variant="contained"
          href="/about-us"
          component={Link}
          className="hover:bg-featureMain bg-navbarButton text-black font-bold py-2 px-8 border border-blue-700 rounded w-32 mb-4 sm:mb-0 sm:ml-0 sm:mr-auto"
          sx={{
            backgroundColor: "#21b3d8",
            color: "black",
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          О нас
        </Button>
      </ThemeProvider>
    </div>
  );
};

export default Footer;
