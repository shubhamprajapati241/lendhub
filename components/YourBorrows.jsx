import React, { useContext, useEffect } from "react";
import lendContext from "../context/lendContext";
import { LoaderSkeleton, RowYourBorrows } from ".";

const YourBorrows = () => {
  const { yourBorrows } = useContext(lendContext);
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Your Borrows</h1>

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
              <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-left align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]"></th>
            </tr>
          </thead>

          <tbody>
            {yourBorrows.length > 0 ? (
              yourBorrows.map((token, index) => (
                <RowYourBorrows
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
    </div>
  );
};

export default YourBorrows;
