import Image from "next/image";
import React, { useState, useContext } from "react";
import { MdLocalGasStation } from "react-icons/md";
import { FiAlertCircle } from "react-icons/fi";
import lendContext from "../context/lendContext";

const ModalSupply = ({
  address,
  name,
  balance,
  image,
  apy,
  isCollateral,
  onClose,
}) => {
  const { supplyAssetsToPool, ApproveToContinue } = useContext(lendContext);
  const [dollerPrice, setDollerPrice] = useState(0);

  const [isInputValidate, setInputValidate] = useState(false);
  const [isApproved, setApproved] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const setMax = () => {
    setInputValue(balance);
    setInputValidate(true);
  };

  const validateInput = (input) => {
    console.log(input);
    if (input) {
      var pattern = new RegExp(/^\d*\.?\d*$/);
      if (!pattern.test(input)) {
        setInputValue("");
        setInputValidate(false);
      } else {
        if (Number(input) > Number(balance)) {
          setInputValue(balance);
        } else {
          setInputValue(input);
        }
        setInputValidate(true);
      }
    } else {
      setInputValue("");
      setInputValidate(false);
    }
  };
  return (
    <div>
      <div className="flex justify-between mb-3">
        <h1 className="text-[18px] font-semibold ">Supply {name}</h1>
        <button className=" text-xl" onClick={() => onClose()}>
          &#10006;
        </button>
      </div>

      {!isCollateral ? (
        <div className="flex justify-center items-center text-xs p-4 bg-[#071F2E] text-[#A9E2FB] rounded mb-5">
          <FiAlertCircle className="text-3xl pr-2 " />

          <div className="flex flex-col">
            <p className="font-semibold text-sm tracking-[0.005rem]">
              Collateral options is not available
            </p>
            <span>
              You cannot use this assets as collateral. <br />
              For collateral purpose you have to choose other assets.{" "}
            </span>
          </div>
        </div>
      ) : (
        <div></div>
      )}

      <div className="flex flex-col mb-5">
        <h1 className="text-sm font-normal text text-[#A5A8B6] pb-[3px]">
          Amount
        </h1>
        <div className="border border-[#A5A8B6] border-opacity-20 p-2 rounded  flex flex-col">
          <div className="flex flex-row justify-between mb-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => validateInput(e.target.value)}
              className="bg-transparent outline-none text-xl font-medium w-3/4"
              placeholder="0.00"
            />
            <div className="font-semibold flex flex-row items-center justify-end w-1/4">
              <Image
                src={image}
                width={22}
                height={22}
                className="card-img-top"
                alt="coin-image"
              />{" "}
              <p className="text-md pl-2 text-[#F1F1F3]">{name}</p>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between text-xs text-[#8E92A3]">
            <p className="w-1/3">$ {dollerPrice}</p>
            <p className="justify-end">
              Wallet Balance{" "}
              {Number(balance).toFixed(2).toString(2).length < 10
                ? Number(balance).toFixed(2).toString().slice(0, 10)
                : `${Number(balance)
                    .toFixed(2)
                    .toString()
                    .slice(0, 10)}...`}{" "}
              <button
                className="font-bold text-[10px] text-[#F1F1F3]"
                onClick={() => setMax()}
              >
                MAX
              </button>{" "}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-5">
        <h1 className="text-sm font-normal text text-[#A5A8B6] pb-[3px]">
          Transaction overview
        </h1>
        <div className="border border-[#A5A8B6] border-opacity-20 p-2 rounded  flex flex-col">
          <div className="flex flex-row items-center justify-between text-[13px] mb-3 text-[#F1F1F3]">
            <p className="">Supply APY</p>
            <p className="justify-end">
              {apy} <span className="text-[#A5A8B6]">%</span>
            </p>
          </div>
          <div className="flex flex-row items-center justify-between text-[13px] text-[#F1F1F3]">
            <p className="">Collateralization</p>
            {isCollateral ? (
              <p className="justify-end text-green-400"> &#10004; Enabled</p>
            ) : (
              <p className="justify-end text-red-400 ">&#10006; Disabled</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center">
        <MdLocalGasStation />
        <p className="text-sm text-[#A5A8B6] pl-1">
          $<span className="pl-[2px]">0.00</span>
        </p>
      </div>

      <div className={!inputValue ? "block" : "hidden"}>
        <button className="w-full bg-[#EBEBEF] bg-opacity-10 p-2 rounded text-[#EBEBEF] tracking-wide text-opacity-30 font-semibold">
          Enter an amount
        </button>
      </div>

      <div className={!inputValue ? "hidden" : "block"}>
        <button
          className={
            isApproved
              ? "w-full bg-[#EBEBEF] bg-opacity-10 p-2 rounded text-[#EBEBEF] tracking-wide text-opacity-30 font-semibold mb-2"
              : "w-full bg-[#F1F1F3] p-2 rounded text-black tracking-wide text-opacity-80 font-semibold mb-2"
          }
          onClick={() => {
            if (isInputValidate) ApproveToContinue(address, inputValue);
          }}
        >
          {!isApproved ? "Aprrove to continue" : "Approved Confirmed !"}
        </button>

        <button
          className={
            isApproved
              ? "w-full bg-[#F1F1F3] p-2 rounded text-black tracking-wide text-opacity-80 font-semibold mb-2"
              : "w-full bg-[#EBEBEF] bg-opacity-10 p-2 rounded text-[#EBEBEF] tracking-wide text-opacity-30 font-semibold mb-2"
          }
          onClick={() => {
            if (!isApproved) return;
            else supplyAssetsToPool(name, inputValue);
            setApproved(false);
          }}
        >
          Supply {name}
        </button>
      </div>
    </div>
  );
};

export default ModalSupply;
