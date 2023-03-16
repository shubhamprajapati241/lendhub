import React from "react";
import { LoaderDiv } from "../components";

const YourSupplyDetails = ({ totalBalance, totalAPY, totalCollateral }) => {
  return (
    <div className="px-6 flex items-center gap-2">
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] px-2 p-1 gap-1">
        <p className="text-slate-500 font-normal">Balance</p>
        <div className="font-medium">
          {totalBalance ? `$${Number(totalBalance).toFixed(2)}` : <LoaderDiv />}
        </div>
      </div>
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] p-1 gap-1">
        <p className="text-slate-500 font-normal">APY</p>
        <div className="font-medium">
          {totalAPY ? `${Number(totalAPY).toFixed(2)} %` : <LoaderDiv />}
        </div>
      </div>
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] p-1 gap-1">
        <p className="text-slate-500 font-normal">Collateral</p>
        <div className="font-medium">
          {totalCollateral ? (
            `$${Number(totalCollateral).toFixed(2)}`
          ) : (
            <LoaderDiv />
          )}
        </div>
      </div>
    </div>
  );
};

export default YourSupplyDetails;
