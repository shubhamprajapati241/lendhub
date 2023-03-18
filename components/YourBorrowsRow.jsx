import Image from "next/image";
import React, { useState } from "react";
import { ModalBorderLayout, ModalRepay } from ".";

const YourBorrowsRow = ({
  address,
  name,
  image,
  borrowQty,
  borrowedBalInUSD,
  borrowApy,
}) => {
  const [showRepayModal, setShowRepayModal] = useState(false);
  return (
    <>
      <tr key={name} className="align-middle text-left text-xs">
        <td className="md:px-4 align-middle border-b-[1px] border-blueGrey-100 md:whitespace-nowrap md:p-4 p-2 ">
          <div className="flex items-center">
            <Image
              src={image}
              className="card-img-top w-5 h-5 md:h-7 md:w-7"
              alt="coin-image"
            />
            <p className="pl-[8px] font-semibold md:text-[13px] text-[12px]">
              {name}
            </p>
          </div>
        </td>
        <td className="md:px-4 align-middle border-b-[1px] border-blueGrey-100  md:whitespace-nowrap md:p-4 ">
          <p className="text-center md:text-[13px] text-[12px] text-gray-600 font-semibold">
            {Number(borrowQty).toFixed(2).toString(2).length < 10
              ? Number(borrowQty).toFixed(2).toString().slice(0, 10)
              : `${Number(borrowQty).toFixed(2).toString().slice(0, 10)}...`}
          </p>

          <p className="text-center md:text-[11px] text-[9px] text-gray-600 font-medium">
            {" "}
            $
            {Number(borrowedBalInUSD).toFixed(2).toString(2).length < 10
              ? Number(borrowedBalInUSD).toFixed(2).toString().slice(0, 10)
              : `${Number(borrowedBalInUSD)
                  .toFixed(2)
                  .toString()
                  .slice(0, 10)}...`}
          </p>
        </td>
        <td className="md:px-4 align-middle border-b-[1px] border-blueGrey-100 md:whitespace-nowrap md:p-4">
          <p className="text-center md:text-[12px] text-[11px] text-gray-600 font-semibold">
            {borrowApy} %
          </p>
        </td>

        <td className="md:px-4  border-b-[1px] border-blueGrey-100 md:whitespace-nowrap md:p-4">
          <p className="border-spacing-1 py-[2px] rounded-[4px] outline-none font-medium text-black bg-slate-50 border border-slate-200   text-center">
            STABLE
          </p>
        </td>

        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 p-2">
          <div className="flex item-center justify-end">
            <button
              className="border-spacing-1 py-[6px] rounded-[4px] outline-none text-[12px] md:text-[13px] text-white bg-[#383D51] hover:bg-[#212430] w-20"
              onClick={() => setShowRepayModal(true)}
            >
              Repay
            </button>
          </div>
        </td>
      </tr>
      <ModalBorderLayout
        isVisible={showRepayModal}
        onClose={() => setShowRepayModal(false)}
      >
        <ModalRepay
          address={address}
          name={name}
          image={image}
          borrowApy={borrowApy}
          debt={borrowQty}
          onClose={() => setShowRepayModal(false)}
        />
      </ModalBorderLayout>
    </>
  );
};

export default YourBorrowsRow;
