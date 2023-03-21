import React, { useContext, useEffect } from "react";
import lendContext from "../context/lendContext";
import { LoaderSkeleton, AssetsToBorrowRow } from ".";
import { FiAlertCircle } from "react-icons/fi";

const AssetsToBorrow = () => {
  const { assetsToBorrow } = useContext(lendContext);
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Assets to Borrow</h1>

      {assetsToBorrow.length > 0 ? (
        <div className="pt-2 md:pt-3">
          <table className="item-center w-full border-collapse bg-transparent">
            <thead>
              <tr>
                <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-center align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]">
                  Asset
                </th>
                <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-center align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]">
                  Available
                </th>
                <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-center align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]">
                  APY
                </th>
                <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-center align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]">
                  APY Type
                </th>
                <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-left align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]"></th>
              </tr>
            </thead>

            <tbody>
              {assetsToBorrow.length > 0 ? (
                assetsToBorrow.map((token, index) => (
                  <AssetsToBorrowRow
                    key={index}
                    address={token.address}
                    name={token.name}
                    image={token.image}
                    borrowApy={token.borrowApy}
                    borrowQty={token.borrowQty}
                  />
                ))
              ) : (
                <LoaderSkeleton />
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mx-5 flex justify-start items-center pl-3 p-1 text-xs bg-[#E5EFFB] rounded mb-5">
          <FiAlertCircle className="text-2xl pr-2 text-[#0062D2]" />
          <div className="flex flex-col">
            <p className="text-[12px] tracking-[0.005rem] p-1">
              You must supply ETH or Tokens as collateral to Borrow
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsToBorrow;
