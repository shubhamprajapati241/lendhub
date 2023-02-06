import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";

const LendState = (props) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [connect, setConnect] = useState(false);
  const [balance, setBalance] = useState("");
  const [network, setNetwork] = useState("");

  const failMessage = "Please install Metamask & connect your Metamask";
  const successMessage = "Account Connected Successfully";

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return console.log(failMessage);

      const account = await ethereum.request({
        method: "eth_requestAccounts",
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });

      const provider = new ethers.providers.Web3Provider(ethereum);
      const network = await provider.getNetwork();
      const signer = provider.getSigner();

      console.log("account " + account);

      if (account.length) {
        setCurrentAccount(account);
      } else {
        return failMessage;
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <LendContext.Provider value={{ currentAccount, connectWallet }}>
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
