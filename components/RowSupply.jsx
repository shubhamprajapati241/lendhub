import Image from "next/image";
import React from "react";

const RowSupply = ({ name, image, balance, isCollateral }) => {
  console.log(balance + " " + typeof balance);
  return (
    <>
      <tr key={name} className="align-middle text-left text-xs">
        <td className="border-t-0 px-4 border align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
          <div className="flex items-center">
            <Image
              src={image}
              width={20}
              height={20}
              className="card-img-top"
              alt="coin-image"
            />
            <div className="pl-2">{name}</div>
          </div>
        </td>
        <td className="border-t-0 px-4 border align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
          <div className="text-center">{Number(balance).toFixed(2)}</div>
        </td>
        <td className="text-center p-4">
          <div>3.18</div>
        </td>
        <td className="border-t-0 px-4 border align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
          <div className="text-green-700 text-lg font-large text-center">
            {" "}
            &#10004;{" "}
          </div>
        </td>
        <td className="border-t-0 px-4 border align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
          <button className="border-spacing-2 bg-slate-200 hover:bg-slate-300 px-4 py-[6px] rounded-[4px] text-black text-sm font-semibold outline-none">
            Supply
          </button>
        </td>
      </tr>
    </>
  );
};

export default RowSupply;
