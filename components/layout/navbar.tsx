import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="bg-gray-400 rounded-b-xl">
      <ul className="flex justify-between py-4 px-6">
        <div>
          <Link href="/">
            <li>Home</li>
          </Link>
        </div>
        <div className="flex items-center">
          <Link href="/chat">
            <li>Chat</li>
          </Link>
          <Link className="ml-12" href="/file-management">
            <li>File management</li>
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <SignedOut>
            <Link href="/sign-in">
              <li>Login</li>
            </Link>
            <Link href="/sign-up">
              <li>Sign Up</li>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/profile">
              <li>Profile</li>
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
