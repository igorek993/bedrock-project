import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-gray-400">
      <ul className="flex justify-between py-4 px-6">
        <div>
          <Link href="/about-us">
            <li>About Us</li>
          </Link>
        </div>
      </ul>
    </div>
  );
};

export default Footer;
