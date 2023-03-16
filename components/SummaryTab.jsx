import React from "react";
import { LoaderDiv } from ".";

const SummaryTab = ({ text1, value1, text2, value2, text3, value3 }) => {
  return (
    <div className="px-6 flex items-center gap-2">
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] px-2 p-1 gap-1">
        <p className="text-slate-500 font-normal">{text1}</p>
        <div className="font-medium">{`$${Number(value1).toFixed(2)}`}</div>
      </div>
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] p-1 gap-1">
        <p className="text-slate-500 font-normal">{text2}</p>
        <div className="font-medium">{`${Number(value2).toFixed(2)} %`}</div>
      </div>
      <div className="flex border border-slate-200 rounded-md md:text-[13px] text-[12px] p-1 gap-1">
        <p className="text-slate-500 font-normal">{text3}</p>
        <div className="font-medium">{`$${Number(value3).toFixed(2)}`}</div>
      </div>
    </div>
  );
};

export default SummaryTab;
