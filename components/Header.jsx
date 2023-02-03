import React from "react";
import { ConnectButton } from "../components";

const Header = () => {
  return (
    <nav className="w-full h-15 text-white flex py-2 px-4 lg:px-10 justify-between items-center border-b-[1px] border-gray-400">
      {/* Brand */}
      <a href="/" className="font-semibold text-md">
        LendHub
      </a>

      {/* Connect Button */}
      <ConnectButton />
    </nav>
  );
};

export default Header;
