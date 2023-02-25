import React from "react";
import { LoaderDiv } from "../components";

const YourSupplyDetails = ({ totalBalance, totalAPY, totalCollateral }) => {
  return (
    <div className="px-6 flex items-center gap-2">
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] px-2 p-1 gap-1">
        <p className="text-slate-500 font-normal">Balance</p>
        <p className="font-medium">
          {totalBalance ? `$${totalBalance}` : <LoaderDiv />}
        </p>
      </div>
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] p-1 gap-1">
        <p className="text-slate-500 font-normal">APY</p>
        <p className="font-medium">
          {totalAPY ? `$${totalAPY}` : <LoaderDiv />}
        </p>
      </div>
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] p-1 gap-1">
        <p className="text-slate-500 font-normal">Collateral</p>
        <p className="font-medium">
          {totalCollateral ? `$${totalCollateral}` : <LoaderDiv />}
        </p>
      </div>
    </div>
  );
};

export default YourSupplyDetails;
