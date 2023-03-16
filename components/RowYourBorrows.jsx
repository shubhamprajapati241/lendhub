import Image from "next/image";
import React, { useState } from "react";
import { ModalBorderLayout, ModalRepay } from ".";

const RowYourBorrows = ({
  address,
  name,
  image,
  borrowQty,
  borrowApy,
}) => {
  const [showRepayModal, setShowRepayModal] = useState(false);
  return (
    <>
      <tr key={name} className="align-middle text-left text-xs">
        <td className="md:px-4 align-middle border-b-[1px] border-blueGrey-100 md:whitespace-nowrap md:p-4 p-2">
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
        <td className="md:px-4 align-middle border-b-[1px] border-blueGrey-100  md:whitespace-nowrap md:p-4">
          <p className="text-center md:text-[13px] text-[12px] text-gray-600 font-semibold">
            {Number(borrowQty).toFixed(2).toString(2).length < 10
              ? Number(borrowQty).toFixed(2).toString().slice(0, 10)
              : `${Number(borrowQty).toFixed(2).toString().slice(0, 10)}...`}
          </p>
        </td>
        <td className="md:px-4 align-middle border-b-[1px] border-blueGrey-100 md:whitespace-nowrap md:p-4">
          <p className="text-center md:text-[12px] text-[11px] text-gray-600 font-semibold">
            {borrowApy} %
          </p>
        </td>
        <td className="md:px-4 align-middle border-b-[1px] border-blueGrey-100 md:whitespace-nowrap md:p-4 p-2">
          <button
            className="border-spacing-1 py-[6px] rounded-[4px] outline-none text-[12px] md:text-[13px] text-white bg-[#2e8240] hover:bg-[#a4b266] p-2 "

            onClick={() => setShowRepayModal(true)}
          >
            Repay
          </button>
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
          borrowQty={borrowQty}
          onClose={() => setShowRepayModal(false)}
        />
      </ModalBorderLayout>
    </>
  );
};

export default RowYourBorrows;
