"use client";

import Link from "next/link";
import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider"; // Import Divider
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HomeIcon from "@mui/icons-material/Home";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#21b3d8",
    },
  },
  typography: {
    button: {
      textTransform: "none", // Prevents any transformation of text on the button
      fontWeight: "bold", // Ensures bold font directly
    },
  },
});

export default function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="flex flex-wrap bg-navbar justify-center">
      <Link className="inline-block sm:mr-9" href="/">
        <img src="/logoTwo.png" width={100} height={100} alt="RUPN Logo" />
      </Link>
      <nav className="bg-navbar p-3 flex items-center flex-1 justify-center sm:justify-start">
        {/* Desktop Links */}
        <Link
          className="hidden sm:inline-flex hover:bg-featureMain bg-navbarButton text-center text-black font-bold py-2 px-8 border border-blue-700 rounded w-45 ml-auto"
          href="/account"
        >
          <HomeIcon className="mr-2" />
          <span>Личный кабинет</span>
        </Link>

        {/* Mobile Menu */}
        <div className="sm:hidden flex flex-1 justify-center">
          <ThemeProvider theme={customTheme}>
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={handleClick}
              sx={{
                backgroundColor: "#21b3d8",
                color: "black",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Как начать?
            </Button>
          </ThemeProvider>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <Link href="/instruction-android" passHref>
              <MenuItem onClick={handleClose} className="flex items-center">
                <PhoneIphoneRoundedIcon className="mr-2" />
                Android
              </MenuItem>
            </Link>
            <Divider />
            <Link href="/instruction-ios" passHref>
              <MenuItem onClick={handleClose} className="flex items-center">
                <PhoneAndroidRoundedIcon className="mr-2" />
                iPhone
              </MenuItem>
            </Link>
            <Divider />
            <Link href="/account" passHref>
              <MenuItem onClick={handleClose} className="flex items-center">
                <HomeIcon className="mr-2" />
                Личный кабинет
              </MenuItem>
            </Link>
          </Menu>
        </div>
      </nav>
    </div>
  );
}
