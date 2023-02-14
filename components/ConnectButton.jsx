import React, { useContext } from "react";

import lendContext from "../context/lendContext";

const ConnectButton = () => {
  const { metamaskDetails, connectWallet } = useContext(lendContext);

  return (
    <div>
      {!metamaskDetails.currentAccount ? (
        <button
          className="border-spacing-2 bg-slate-200 hover:bg-slate-300 px-4 py-[6px] rounded-[4px] text-black text-sm font-semibold outline-none"
          onClick={() => connectWallet()}
        >
          Connect wallet
        </button>
      ) : (
        <button className="border-spacing-2 bg-slate-200 hover:bg-slate-300 px-4 py-[6px] rounded-[4px] text-black text-sm font-semibold outline-none flex">
          <p className="uppercase">{metamaskDetails.networkName} - </p>
          {` ${metamaskDetails.currentAccount
            .toString()
            .substring(0, 4)}...${metamaskDetails.currentAccount
            .toString()
            .substring(38, 42)}`}
        </button>
      )}
    </div>
  );
};

export default ConnectButton;
