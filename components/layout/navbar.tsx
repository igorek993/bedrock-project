"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  // Define reusable styles for active and inactive states
  const activeClass = "text-blue-500 font-bold";
  const inactiveClass = "text-black";

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
    <div className="bg-gray-400 rounded-b-xl">
      <ul className="flex justify-between py-4 px-6">
        <div>
          <Link href="/">
            <li className={getClassName("/")}>Home</li>
          </Link>
        </div>
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
            <Link href="/profile">
              <li className={getClassName("/profile")}>Profile</li>
            </Link>
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
