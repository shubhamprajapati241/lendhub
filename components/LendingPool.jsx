import React from "react";
import {
  YourSupplies,
  BorrowTab,
  SupplyAssets,
  BorrowAssets,
  YourBorrows,
} from "../components";

const LendingPool = () => {
  return (
    <div className="px-2 md:px-16 -mt-10">
      <div className="flex flex-wrap md:flex-nowrap gap-3">
        <YourSupplies />
        <YourBorrows />
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-3 pt-3">
        <SupplyAssets />
        <BorrowAssets />
      </div>

      <div className="h-32"></div>
    </div>
  );
};

export default LendingPool;
