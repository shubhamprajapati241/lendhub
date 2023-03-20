import Image from "next/image";
import React, { useState } from "react";
import Switch from "react-switch";
import { ModalBorderLayout, ModalWithdraw } from "../components";

const YourSuppliesRow = ({
  address,
  name,
  image,
  apy,
  balance,
  maxSupply,
  balanceInUSD,
  isCollateral,
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <>
      <tr key={name}>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 p-2">
          <div className="flex items-center">
            <Image
              src={image}
              alt="coin-image"
              className="card-img-top w-5 h-5 md:h-7 md:w-7"
            />
            <p className="pl-[8px] font-semibold md:text-[13px] text-[12px]">
              {name}
            </p>
          </div>
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4">
          <p className="text-center md:text-[13px] text-[12px] text-gray-600 font-semibold">
            {Number(balance).toFixed(2).toString(2).length < 10
              ? Number(balance).toFixed(2).toString().slice(0, 10)
              : `${Number(balance).toFixed(2).toString().slice(0, 10)}...`}
          </p>

          <p className="text-center md:text-[11px] text-[9px] text-gray-600 font-medium">
            {" "}
            $
            {Number(balanceInUSD).toFixed(2).toString(2).length < 10
              ? Number(balanceInUSD).toFixed(2).toString().slice(0, 10)
              : `${Number(balanceInUSD).toFixed(2).toString().slice(0, 10)}...`}
          </p>
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4">
          <p className="text-center md:text-[13px] text-[12px] text-gray-600 font-semibold">
            {apy} %
          </p>
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 justify-center text-center">
          <Switch
            checked={isCollateral}
            checkedIcon={false}
            uncheckedIcon={false}
            handleDiameter={0}
            height={18}
            onColor="#0ba34d"
            width={35}
            activeBoxShadow="0 0 2px 3px #3bf"
            disabled={true}
            onChange={() => {}}
          />
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 p-2">
          <div className="flex item-center justify-end">
            <button
              className="border-spacing-1 py-[6px] rounded-[4px] outline-none text-[12px] md:text-[13px] text-white bg-[#383D51] hover:bg-[#212430] w-20"
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw
            </button>
          </div>
        </td>
      </tr>
      <ModalBorderLayout
        isVisible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      >
        {" "}
        <ModalWithdraw
          address={address}
          name={name}
          image={image}
          balance={balance}
          maxSupply={maxSupply}
          remainingSupply={balance}
          onClose={() => setShowWithdrawModal(false)}
        />
      </ModalBorderLayout>
    </>
  );
};

export default YourSuppliesRow;
