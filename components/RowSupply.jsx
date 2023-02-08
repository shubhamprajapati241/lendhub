import Image from "next/image";
import React from "react";

const RowSupply = ({ name, image, balance, apy, isCollateral }) => {
  console.log(name + balance + " " + typeof balance);
  return (
    <>
      <tr key={name} className="align-middle text-left text-xs">
        <td className="border-t-0 md:px-4 px-1 border align-middle border-l-0 border-r-0 md:whitespace-nowrap md:p-4">
          <div className="flex items-center">
            <Image
              src={image}
              width={28}
              height={28}
              className="card-img-top"
              alt="coin-image"
            />
            <div className="pl-[8px] font-semibold text-[13px]">{name}</div>
          </div>
        </td>
        <td className="border-t-0 md:px-4 px-1 border align-middle border-l-0 border-r-0  md:whitespace-nowrap md:p-4">
          <div className="text-center text-[12px] text-gray-600 font-semibold">
            {Number(balance).toFixed(2)}
          </div>
        </td>
        <td className="border-t-0 md:px-4 px-1 border align-middle border-l-0 border-r-0 md:whitespace-nowrap md:p-4">
          <div className="text-center text-[12px] text-gray-600 font-semibold">
            {apy}
          </div>
        </td>
        <td className="border-t-0 md:px-4 px-1 border align-middle border-l-0 border-r-0 md:whitespace-nowrap md:p-4">
          <div className="text-green-700 text-lg font-large text-center">
            {" "}
            &#10004;{" "}
          </div>
        </td>
        <td className="border-t-0 md:px-4 px-1 border align-middle border-l-0 border-r-0 md:whitespace-nowrap md:p-4">
          <button className="border-spacing-2 bg-slate-200 hover:bg-slate-300 px-4 py-[6px] rounded-[4px] text-black text-sm font-semibold outline-none">
            Supply
          </button>
        </td>
      </tr>
    </>
  );
};

export default RowSupply;
