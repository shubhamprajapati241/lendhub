import Image from "next/image";
import React, { useState, useContext } from "react";
import { MdLocalGasStation } from "react-icons/md";
import { BiError } from "react-icons/bi";
import lendContext from "../context/lendContext";
import { toast } from "react-toastify";

const ModalRepay = ({ 
  address, 
  name, 
  debt, 
  image, 
  onClose 
}) => {
  const { 
    getAmountInUSD, 
    repayAsset, 
    numberToEthers, 
    connectWallet,
    ApproveToContinue 
  } =
    useContext(lendContext);
  const [dollarPrice, setDollarPrice] = useState(0);
  const [isInputValidate, setInputValidate] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [loadingOnApprove, setLoadingOnApprove] = useState(false);

  const setMax = () => {
    setInputValue(debt);
    getdebtInUSD(debt);
    setInputValidate(true);
  };

  const getdebtInUSD = async (amount) => {
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
        if (Number(input) > Number(debt)) {
          setInputValue(debt);
          getdebtInUSD(debt);
        } else {
          setInputValue(input);
          getdebtInUSD(input);
        }
        setInputValidate(true);
      }
    } else {
      setInputValue("");
      setDollarPrice(0);
      setInputValidate(false);
    }
  };

  const handleApprove = async () => {
    const isTokenApproved = await ApproveToContinue(address, inputValue);
    // console.log(isTokenApproved);
    toast.success(`Approved ${inputValue} ${name}`);
    if (isTokenApproved) setIsApproved(true);
  };

  const handleRepay = async () => {
    const isRepayed = await repayAsset(address, inputValue);
    // console.log(isRepayed);
    toast.success(`Repayed ${inputValue} ${name}`);
    if (isRepayed) {
      onClose();
      await connectWallet();
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-3">
        <h1 className="text-[18px] font-semibold ">Repay {name}</h1>
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
              Wallet debt{" "}
              {Number(debt).toFixed(2).toString(2).length < 10
                ? Number(debt).toFixed(2).toString().slice(0, 10)
                : `${Number(debt).toFixed(2).toString().slice(0, 10)}...`}{" "}
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
            <p className="">Remaining debt </p>
            <p className="justify-end">
              {inputValue ? `${debt} → ${debt - inputValue}` : `${debt}`}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center">
        <MdLocalGasStation />
        <p className="text-sm text-[#A5A8B6] pl-1">
          $<span className="pl-[2px]">0.00</span>
        </p>
      </div>

      <div className={!isInputValidate ? "block" : "hidden"}>
        <button className="w-full bg-[#EBEBEF] bg-opacity-10 p-2 rounded text-[#EBEBEF] tracking-wide text-opacity-30 font-semibold">
          Enter an amount
        </button>
      </div>
{/* insert here */}

<div className={!inputValue ? "hidden" : "block"}>
        {name == "ETH" ? (
          <button
            className={
              "w-full bg-[#F1F1F3] p-2 rounded text-black tracking-wide text-opacity-80 font-semibold mb-2"
            }
            onClick={() => {
              if (isInputValidate) handleRepay();
            }}
          >
            Repay {name}
          </button>
        ) : (
          <div>
            {" "}
            <button
              className={
                isApproved
                  ? "w-full bg-[#EBEBEF] bg-opacity-10 p-2 rounded text-[#EBEBEF] tracking-wide text-opacity-30 font-semibold mb-2"
                  : "w-full bg-[#F1F1F3] p-2 rounded text-black tracking-wide text-opacity-80 font-semibold mb-2"
              }
              onClick={() => {
                if (isInputValidate) {
                  setLoadingOnApprove(true);
                  handleApprove();
                }
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
                else handleRepay();
              }}
            >
              Repay {name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ModalRepay;
