"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();

  // Define reusable styles for active and inactive states
  const activeClass = "bg-[#219ebc] font-bold py-4 px-4 rounded-xl";
  const inactiveClass = "text-black py-4 px-4";

  // Helper function to check if the tab is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path; // Strict match for Home
    }
    return pathname.startsWith(path); // Partial match for other paths
  };

  // Helper function to get the correct class for a tab
  const getClassName = (path: string) =>
    isActive(path) ? activeClass : inactiveClass;

  return (
    <div
      className="bg-[#8ecae6] rounded-b-xl bg-no-repeat bg-left bg-contain pl-1 mb-1"
      // style={{
      //   backgroundImage: "url('/filenova-high-resolution-logo-bigger.png')",
      // }}
    >
      <ul className="flex justify-between px-6">
        <div>
          <Link href="/">
            <li className={getClassName("/")}>Home</li>
          </Link>
        </div>
        {isSignedIn && (
          <div className="flex items-center">
            <Link href="/chat">
              <li className={getClassName("/chat")}>Chat</li>
            </Link>
            <Link className="ml-12" href="/file-management">
              <li className={getClassName("/file-management")}>
                File management
              </li>
            </Link>
          </div>
        )}
        <div className="flex gap-6 items-center">
          <SignedOut>
            <Link href="/sign-in">
              <li className={getClassName("/sign-in")}>Login</li>
            </Link>
            <Link href="/sign-up">
              <li className={getClassName("/sign-up")}>Sign Up</li>
            </Link>
          </SignedOut>
          <SignedIn>
            <li className="flex items-center">
              <UserButton />
            </li>
          </SignedIn>
        </div>
      </ul>
    </div>
  );
};

export default Navbar;
