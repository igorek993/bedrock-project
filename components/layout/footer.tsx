import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";

const Footer = () => {
  const { userId } = auth();
  return (
    <div className="bg-gray-400 ">
      <ul className="flex justify-between py-4 px-6">
        <div>
          <Link href="/">
            <li>About Us</li>
          </Link>
        </div>
      </ul>
    </div>
  );
};

export default Footer;
