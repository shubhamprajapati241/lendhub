import Image from "next/image";
import React, { useState } from "react";
import Switch from "react-switch";
import { ModalBorderLayout, ModalSupply, ModalWithdraw } from "../components";

const RowYourSupply = ({
  name,
  image,
  apy,
  balance,
  dollarPrice,
  isCollateral,
}) => {
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showWithdrawModal, setShowWihdrawModal] = useState(false);

  return (
    <>
      <tr key={name}>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 ">
          <div className="flex items-center">
            <Image
              src={image}
              alt="coin-image"
              width={28}
              height={28}
              className="card-img-top"
            />
            <p className="pl-[8px] font-semibold text-[13px]">{name}</p>
          </div>
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 ">
          <p className="text-center text-[13px] text-gray-600 font-semibold">
            {Number(balance).toFixed(2).toString(2).length < 10
              ? Number(balance).toFixed(2).toString().slice(0, 10)
              : `${Number(balance).toFixed(2).toString().slice(0, 10)}...`}
          </p>

          <p className="text-center text-[11px] text-gray-600 font-medium">
            {" "}
            $
            {Number(dollarPrice).toFixed(2).toString(2).length < 10
              ? Number(dollarPrice).toFixed(2).toString().slice(0, 10)
              : `${Number(dollarPrice).toFixed(2).toString().slice(0, 10)}...`}
          </p>
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 ">
          <p className="text-center text-[12px] text-gray-600 font-semibold">
            {apy} %
          </p>
        </td>
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 justify-center text-center ">
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
        <td className="md:px-4 border-b-[1px] border-blueGrey-100 m:whitespace-nowrap md:p-4 ">
          <div className="flex item-center justify-end">
            <button
              className="border-spacing-1 py-[6px] rounded-[4px] outline-none text-[13px] text-white bg-[#383D51] hover:bg-[#212430] p-2"
              onClick={() => setShowWihdrawModal(true)}
            >
              Withdraw
            </button>
            <button
              className="border-spacing-1 py-[6px] ml-1 rounded-[4px] outline-none text-[13px] text-black bg-slate-50 border border-slate-200 p-2 hover:border-slate-500"
              onClick={() => setShowSupplyModal(true)}
            >
              Lend
            </button>
          </div>
        </td>
      </tr>

      <ModalBorderLayout
        isVisible={showSupplyModal}
        onClose={() => setShowSupplyModal(false)}
      >
        <ModalSupply
          name={name}
          balance={balance}
          image={image}
          apy={apy}
          isCollateral={isCollateral}
          onClose={() => setShowSupplyModal(false)}
        />
      </ModalBorderLayout>

      <ModalBorderLayout
        isVisible={showWithdrawModal}
        onClose={() => setShowWihdrawModal(false)}
      >
        {" "}
        <ModalWithdraw
          name={name}
          image={image}
          balance={balance}
          remainingSupply={balance}
          onClose={() => setShowWihdrawModal(false)}
        />
      </ModalBorderLayout>
    </>
  );
};

export default RowYourSupply;
