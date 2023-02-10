import React from "react";
import { RowYourSupply, YourSupplyDetails } from "../components";

import { eth, dai, usdc, usdt, weth } from "../assets";

const YourSupply = () => {
  const tokenArray = [
    {
      image: eth,
      name: "ETH",
      balance: "100",
      apy: 3.18,
      isCollateral: true,
    },
    {
      image: dai,
      name: "DAI",
      balance: "120",
      apy: "3.18",
      isCollateral: true,
    },
  ];
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Your supplies</h1>
      {/* <p className="py-5 p-6 text-sm text-gray-500">Nothing supplied yet</p> */}

      <YourSupplyDetails
        totalBalance={"10.603.20"}
        totalAPY={"43.61"}
        totalCollateral={"10.608.30"}
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
            {tokenArray.map((token, index) => (
              <RowYourSupply
                key={index}
                name={token.name}
                balance={token.balance}
                image={token.image}
                apy={token.apy}
                isCollateral={token.isCollateral}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YourSupply;
