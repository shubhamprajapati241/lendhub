import Image from "next/image";
import React, { useState, useContext } from "react";
import { BiError } from "react-icons/bi";
import lendContext from "../context/lendContext";
import { toast } from "react-toastify";
import { ImSpinner8 } from "react-icons/im";

const ModalBorrow = ({
  address,
  name,
  available,
  image,
  borrowApy,
  onClose,
}) => {
  const { getAmountInUSD, borrowAsset, numberToEthers, connectWallet } =
    useContext(lendContext);
  const [dollarPrice, setDollarPrice] = useState(0);
  const [isInputValidate, setInputValidate] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isBorrowing, setIsBorrowing] = useState(false);

  const setMax = () => {
    setInputValue(available);
    getAvailableInUSD(available);
    setInputValidate(true);
  };

  const getAvailableInUSD = async (amount) => {
    const amount2 = numberToEthers(amount);
    const amountInUSD = await getAmountInUSD(address, amount2);
    setDollarPrice(amountInUSD);
  };

  const validateInput = (input) => {
    if (input) {
      var pattern = new RegExp(/^\d*\.?\d*$/);
      if (!pattern.test(input)) {
        setInputValue("");
        setInputValidate(false);
      } else {
        if (Number(input) > Number(available)) {
          setInputValue(available);
          getAvailableInUSD(available);
        } else {
          setInputValue(input);
          getAvailableInUSD(input);
        }
        setInputValidate(true);
      }
    } else {
      setInputValue("");
      setDollarPrice(0);
      setInputValidate(false);
    }
  };

  const handleBorrow = async () => {
    setIsBorrowing(true);
    const transaction = await borrowAsset(address, inputValue);
    if (transaction.status == 200) {
      toast.success(`Borrowed ${inputValue} ${name}`);
      setIsBorrowing(false);
      onClose();
      await connectWallet();
    } else {
      toast.error(`Borrow Failed...`);
      setIsBorrowing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-3">
        <h1 className="text-[18px] font-semibold ">Borrow {name}</h1>
        <button className=" text-xl" onClick={() => onClose()}>
          &#10006;
        </button>
      </div>

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
            <p className="w-1/3">
              ${" "}
              {Number(dollarPrice).toFixed(2).toString(2).length < 10
                ? Number(dollarPrice).toFixed(2).toString().slice(0, 10)
                : `${Number(dollarPrice)
                    .toFixed(2)
                    .toString()
                    .slice(0, 10)}...`}{" "}
            </p>
            <p className="justify-end">
              Available{" "}
              {Number(available).toFixed(2).toString(2).length < 10
                ? Number(available).toFixed(2).toString().slice(0, 10)
                : `${Number(available)
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
          <div className="flex flex-row items-center justify-between text-[13px] text-[#F1F1F3]">
            <p className="">Borrow APY</p>
            <p className="justify-end">
              {borrowApy} <span className="text-[#A5A8B6]">%</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center text-xs p-2 bg-[#2E0C0A] text-[#FBB4AF] rounded mb-5">
        <BiError className="text-3xl pr-2 " />

        <div className="flex flex-col">
          <p className="font-medium text-[10px] tracking-[0.005rem]">
            Borrowing this amount will increase risk of liquidation.
          </p>
        </div>
      </div>

      <div className={!isInputValidate ? "block" : "hidden"}>
        <button className="w-full bg-[#EBEBEF] bg-opacity-10 p-2 rounded text-[#EBEBEF] tracking-wide text-opacity-30 font-semibold">
          Enter an amount
        </button>
      </div>

      <div className={!isInputValidate ? "hidden" : "block"}>
        <button
          className="w-full bg-[#F1F1F3] p-2 rounded text-black tracking-wide text-opacity-80 font-semibold mb-2 flex justify-center items-center"
          onClick={() => {
            handleBorrow();
          }}
        >
          {!isBorrowing && <span>Borrow {name}</span>}
          {isBorrowing && (
            <ImSpinner8 icon="spinner" className="spinner mr-2" />
          )}
          {isBorrowing && <span>Borrowing {name} ...</span>}
        </button>
      </div>
    </div>
  );
};

export default ModalBorrow;
