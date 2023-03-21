import React from "react";
import { ConnectButton } from "../components";
import Image from "next/image";
import { metamask } from "../assets";

const DisconnectedTab = () => {
  return (
    <div className="px-2 md:px-16 -mt-10">
      <div className="flex flex-col w-full bg-white rounded-md py-5 md:py-10  justify-center items-center text-center ">
        <Image
          src={metamask}
          alt="metamask"
          className="w-24 h-24 md:w-32 md:h-32 mb-3"
        />
        <h1 className=" text-xl font-semibold text-[#303549] mb-2">
          Please, connect your wallet with Sepolia Network
        </h1>
        <p className="text-sm text-[#62677B] mb-5">
          Please connect your wallet to see your supplies, borrowings, and open
          positions.
        </p>
        <ConnectButton />
      </div>
    </div>
  );
};

export default DisconnectedTab;
