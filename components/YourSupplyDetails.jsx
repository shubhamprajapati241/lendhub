import React from "react";

const YourSupplyDetails = ({ totalBalance, totalAPY, totalCollateral }) => {
  return (
    <div className="px-6 flex items-center gap-2">
      <div className="flex border border-slate-200 rounded-md text-[13px] px-2 p-1 gap-1">
        <p className="text-slate-500 font-normal">Balance</p>
        <p className="font-medium">$ {totalBalance}</p>
      </div>
      <div className="flex border border-slate-200 rounded-md text-[13px] p-1 gap-1">
        <p className="text-slate-500 font-normal">APY</p>
        <p className="font-medium">{totalAPY}</p>
      </div>
      <div className="flex border border-slate-200 rounded-md text-[13px] p-1 gap-1">
        <p className="text-slate-500 font-normal">Collateral</p>
        <p className="font-medium"> $ {totalCollateral}</p>
      </div>
    </div>
  );
};

export default YourSupplyDetails;
