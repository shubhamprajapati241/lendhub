import React, { useContext, useEffect } from "react";
import lendContext from "../context/lendContext";
import { LoaderSkeleton, RowAssetsToBorrow } from "../components";

// const BorrowAssets = () => {
//   return (
//     <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
//       <h1 className="px-6 py-5 font-semibold text-md">Assets to borrow</h1>
//       <p className="py-5 p-6 text-sm text-gray-500">Nothing borrowed yet</p>
//     </div>
//   );
// };

const BorrowAssets = () => {
  const { assetsToBorrow } = useContext(lendContext);
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Assets to Borrow</h1>

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
              <th className="font-medium text-[11px] md:text-xs px-3 text-[#62677B] text-left align-middle border-b-[1px] border-blueGrey-100 whitespace-nowrap p-[6px]"></th>
            </tr>
          </thead>

          <tbody>
            {assetsToBorrow.length > 0 ? (
              assetsToBorrow.map((token, index) => (
                <RowAssetsToBorrow
                  key={index}
                  address={token.address}
                  name={token.name}
                  image={token.image}
                  borrowApy={token.borrowApy}
                  available={token.qty}
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

export default BorrowAssets;
