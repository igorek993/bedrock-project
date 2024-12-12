import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 shadow-md relative">
      <ul className="flex justify-between items-center px-6">
        {/* Left-aligned Button */}
        <div className="z-20">
          <Link href="/about-us">
            <li className="text-white bg-blue-500 py-2 px-4 rounded-md shadow-md hover:bg-blue-600 hover:text-gray-200 transition">
              About Us
            </li>
          </Link>
        </div>
        {/* Centered Copyright Notice */}
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium z-10">
          © {new Date().getFullYear()} FileNova. All rights reserved.
        </div>

        {/* Right-aligned Buttons */}
        <div className="flex gap-4 z-20">
          {/* <Link href="/privacy-policy">
            <li className="text-white bg-blue-500 py-2 px-4 rounded-md shadow-md hover:bg-blue-600 hover:text-gray-200 transition">
              Privacy Policy
            </li>
          </Link> */}
          <Link href="/contact-us">
            <li className="text-white bg-blue-500 py-2 px-4 rounded-md shadow-md hover:bg-blue-600 hover:text-gray-200 transition">
              Contact Us
            </li>
          </Link>
        </div>
      </ul>
    </div>
  );
};

export default Footer;
