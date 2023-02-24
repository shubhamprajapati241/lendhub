import React, { useContext } from "react";
import {
  RowYourSupply,
  YourSupplyDetails,
  LoaderSkeleton,
} from "../components";
import lendContext from "../context/lendContext";

const YourSupply = () => {
  const { supplyDetails } = useContext(lendContext);
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Your supplies</h1>
      {/* <p className="py-5 p-6 text-sm text-gray-500">Nothing supplied yet</p> */}

      <YourSupplyDetails
        totalBalance={supplyDetails.details.totalBalance}
        totalAPY={supplyDetails.details.totalAPY}
        totalCollateral={supplyDetails.details.totalCollateral}
      />

      <div className="pt-3">
        <table className="item-center w-full border-col bg-transparent">
          <thead>
            <tr>
              <th className="font-medium text-xs px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                Asset
              </th>
              <th className="font-medium text-xs px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                Balance
              </th>
              <th className="font-medium text-xs px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                APY
              </th>
              <th className="font-medium text-xs px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 ">
                Collateral
              </th>
              <th className="font-medium text-xs px-3 text-[#62677B] text-center align-middle whitespace-nowrap p-[6px] border-b-[1px] border-blueGrey-100 "></th>
            </tr>
          </thead>

          <tbody>
            {supplyDetails.length > 0 ? (
              supplyDetails.assets.map((token, index) => (
                <RowYourSupply
                  key={index}
                  name={token.name}
                  balance={token.balance}
                  dollarPrice={token.dollarPrice}
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
  );
};

export default YourSupply;
