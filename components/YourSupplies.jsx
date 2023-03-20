import React, { useContext } from "react";

import { YourSuppliesRow, SummaryTab, LoaderSkeleton } from "../components";
import lendContext from "../context/lendContext";

const YourSupplies = () => {
  const { supplySummary, supplyAssets } = useContext(lendContext);
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Your supplies</h1>

      {supplyAssets.length > 0 ? (
        <div>
          <SummaryTab
            text1={"Balance"}
            value1={supplySummary.totalUSDBalance}
            text2={"APY"}
            value2={supplySummary.weightedAvgAPY}
            text3={"Collateral"}
            value3={supplySummary.totalUSDCollateral}
          />
          <div className="pt-3">
            <table className="item-center w-full border-col bg-transparent">
              <thead>
                <tr>
                  <th className="font-medium text-[11px] md:text-xs  px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                    Asset
                  </th>
                  <th className="font-medium text-[11px] md:text-xs  px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                    Balance
                  </th>
                  <th className="font-medium text-[11px] md:text-xs  px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                    APY
                  </th>
                  <th className="font-medium text-[11px] md:text-xs  px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                    Collateral
                  </th>
                  <th className="font-medium text-[11px] md:text-xs  px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 "></th>
                </tr>
              </thead>

              <tbody>
                {supplyAssets.length > 0 ? (
                  supplyAssets.map((token, index) => (
                    <YourSuppliesRow
                      key={index}
                      address={token.address}
                      name={token.name}
                      balance={token.balance}
                      balanceInUSD={token.balanceInUSD}
                      maxSupply={token.maxSupply}
                      image={token.image}
                      apy={token.apy}
                      isCollateral={token.isCollateral}
                    />
                  ))
                ) : (
                  <LoaderSkeleton />
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="py-5 p-6 text-sm text-gray-500">Nothing Supplied yet</p>
      )}
    </div>
  );
};

export default YourSupplies;
