import React, { useContext, useEffect } from "react";
import lendContext from "../context/lendContext";
import { LoaderSkeleton, YourBorrowsRow, SummaryTab } from "../components";

const YourBorrows = () => {
  const { yourBorrows, borrowSummary } = useContext(lendContext);
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Your Borrows</h1>

      {yourBorrows.length > 0 ? (
        <div>
          <SummaryTab
            text1={"Balance"}
            value1={borrowSummary.totalUSDBalance}
            text2={"APY"}
            value2={borrowSummary.weightedAvgAPY}
            text3={"Borrow power used"}
            value3={borrowSummary.totalBorrowPowerUsed}
          />
          <div className="pt-2 md:pt-3">
            <table className="item-center w-full border-collapse bg-transparent">
              <thead>
                <tr>
                  <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-center align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]">
                    Asset
                  </th>
                  <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-center align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]">
                    Debt
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
                {yourBorrows.length > 0 ? (
                  yourBorrows.map((token, index) => (
                    <YourBorrowsRow
                      key={index}
                      address={token.address}
                      name={token.name}
                      image={token.image}
                      borrowedBalInUSD={token.borrowedBalInUSD}
                      borrowApy={token.borrowApy}
                      borrowQty={token.borrowQty / 1e18}
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
        <p className="py-5 p-6 text-sm text-gray-500">Nothing borrowed yet</p>
      )}
    </div>
  );
};

export default YourBorrows;
