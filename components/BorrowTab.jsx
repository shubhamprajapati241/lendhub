import React, { useContext } from "react";
import lendContext from "../context/lendContext";

const BorrowTab = () => {
  const { getAssets } = useContext(lendContext);
  return (
    <div className="w-full md:w-1/2 h-30 bg-white rounded-md ">
      <h1 className="px-6 py-5 font-semibold text-md">Your borrows</h1>
      <p className="py-5 p-6 text-sm text-gray-500">Nothing borrowed yet</p>

      <button
        className="border-spacing-2 bg-slate-200 ml-10 hover:bg-slate-300 px-4 py-[6px] rounded-[4px] text-black text-sm font-semibold outline-none"
        onClick={() => getAssets()}
      >
        Get Assets
      </button>
    </div>
  );
};

export default BorrowTab;
