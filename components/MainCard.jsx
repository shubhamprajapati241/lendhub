import React from "react";
import { ether } from "../assets";
import Image from "next/image";

import { BiWallet } from "react-icons/bi";
import { BsBarChart } from "react-icons/bs";

const MainCard = () => {
  return (
    <div className="px-8 md:px-20 py-12">
      <div className="flex items-center pb-4 justify-center">
        <Image
          src={ether}
          alt="Ether icon"
          className="w-8 h-8 md:w-10 md:h-10"
        />
        <h1 className="pl-2 font-bold text-2xl md:text-5xl">DeFi Lend & Borrow</h1>
      </div>
      {/* <div className="flex gap-6">
        <div className="flex justify-start items-center">
          <div className="icon-box border border-spacing-3  border-gray-600 p-3 rounded-2xl bg-[#383D51]  hidden md:block">
            <BiWallet className="text-[#cfcece] text-xl" />
          </div>
          <div className="flex flex-col ml-2 text-[#CCCCCC]">
            <p className="text-sm">Net worth</p>
            <p className="font-semibold">
              $<span className="text-white pl-[2px]">0</span>
            </p>
          </div>
        </div> */}

        {/* <div className="flex justify-start items-center">
          <div className="icon-box border border-spacing-3 border-gray-600 p-3 rounded-2xl bg-[#383D51]  hidden md:block">
            <BsBarChart className="text-[#cfcece] text-xl" />
          </div>
          <div className="flex flex-col ml-2 text-[#CCCCCC]">
            <p className="text-sm">Net APY</p>
            <p className="font-semibold">__</p>
          </div>
        </div>
       </div> */}
    </div>
  );
};

export default MainCard;
