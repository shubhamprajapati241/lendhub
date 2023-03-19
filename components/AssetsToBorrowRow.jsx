import Image from "next/image";
import React, { useState } from "react";
import { ModalBorderLayout, ModalBorrow } from ".";

const AssetsToBorrowRow = ({ address, name, image, borrowQty, borrowApy }) => {
  const [showModal, setShowModal] = useState(false);
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
        <td
          className={
            parseInt(Number(borrowQty)) != 0
              ? "md:px-4 align-middle border-b-[1px] border-blueGrey-100 text-gray-600  md:whitespace-nowrap md:p-4"
              : "md:px-4 align-middle border-b-[1px] border-blueGrey-100  text-gray-300 md:whitespace-nowrap md:p-4"
          }
        >
          <p className="text-center md:text-[13px] text-[12px]  font-semibold">
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

        <td className="md:px-4  border-b-[1px] border-blueGrey-100 md:whitespace-nowrap md:p-4">
          <p className="border-spacing-1 py-[2px] rounded-[4px] outline-none font-medium text-black bg-slate-50 border border-slate-200   text-center">
            STABLE
          </p>
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 p-2">
          <div className="flex item-center justify-end">
            <button
              className={
                parseInt(Number(borrowQty)) != 0
                  ? "border-spacing-1 py-[6px] rounded-[4px] outline-none text-[12px] md:text-[13px] text-white bg-[#383D51] hover:bg-[#212430] w-20"
                  : "w-full bg-[#9597a0] bg-opacity-10 p-2 rounded text-gray-600 tracking-wide text-opacity-30 font-semibold"
              }
              onClick={() => {
                if (parseInt(Number(borrowQty)) != 0) setShowModal(true);
              }}
            >
              Borrow
            </button>
          </div>
        </td>
      </tr>
      <ModalBorderLayout
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      >
        <ModalBorrow
          address={address}
          name={name}
          image={image}
          borrowApy={borrowApy}
          available={borrowQty}
          onClose={() => setShowModal(false)}
        />
      </ModalBorderLayout>
    </>
  );
};

export default AssetsToBorrowRow;
