"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();

  // Define reusable styles for active and inactive states
  const activeClass =
    "bg-blue-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:bg-blue-600 transition";
  const inactiveClass =
    "bg-white text-blue-600 py-2 px-4 rounded-md shadow-md hover:bg-blue-500 hover:text-white transition";

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
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 shadow-md">
      <ul className="flex justify-between items-center px-6">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href="/">
            <span className="hover:text-gray-200 transition">FileNova</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          {/* <Link href="/">
            <li className={getClassName("/")}>Home</li>
          </Link> */}
          {isSignedIn && (
            <>
              <Link href="/chat">
                <li className={getClassName("/chat")}>Chat</li>
              </Link>
              <Link href="/file-management">
                <li className={getClassName("/file-management")}>
                  File Management
                </li>
              </Link>
            </>
          )}
        </div>

        {/* Auth Links */}
        <div className="flex items-center gap-6">
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
