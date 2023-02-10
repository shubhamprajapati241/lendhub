import React, { useContext, useEffect } from "react";
import { ConnectButton } from "../components";
import { logo } from "../assets";
import Image from "next/image";

const Header = () => {
  return (
    <nav className="w-full h-15 text-white flex py-2 px-4 lg:px-10 justify-between items-center border-b-[1px] border-gray-400">
      <a href="/">
        <Image src={logo} alt="Ether icon" className="w-28 hover:opacity-80" />
      </a>
      <ConnectButton />
    </nav>
  );
};

export default Header;
