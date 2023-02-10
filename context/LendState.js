import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";

const ERC20ABI = require("./erc20_abi.json");
const addresses = require("../token-list-goerli.json");

const LendState = (props) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [network, setNetwork] = useState("");

  // for user supply assets
  const [supplyEther, setSupplyEther] = useState(0);
  const [supplyDAI, setSupplyDAI] = useState(0);
  const [supplyUSDC, setSupplyUSDC] = useState(0);
  const [supplyUSDT, setSupplyUSDT] = useState(0);
  const [supplyWETH, setSupplyWETH] = useState(0);

  const failMessage = "Please install Metamask & connect your Metamask";

  const connectWallet = async () => {
    const { ethereum } = window;
    try {
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

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      // Getting user ether balance
      let eth = await provider.getBalance(account[0]);
      eth = ethers.utils.formatEther(eth);

      if (account.length) {
        setCurrentAccount(account[0]);
        setNetwork(network.name);
        setSupplyEther(eth);
        fetchUserAssets(provider, account[0]);
      } else {
        return failMessage;
      }
    } catch (e) {
      console.log("error" + e);
    }
  };

  const fetchUserAssets = async (provider, account) => {
    addresses.map(async (token) => {
      let tok;
      const tokenContract = await new ethers.Contract(
        token.address,
        ERC20ABI,
        provider
      );

      tok = await tokenContract.balanceOf(account);
      tok = ethers.utils.formatUnits(tok, token.decimal);

      if (token.name == "DAI") {
        setSupplyDAI(tok);
      } else if (token.name == "USDC") {
        setSupplyUSDC(tok);
      } else if (token.name == "USDT") {
        setSupplyUSDT(tok);
      } else if (token.name == "WETH") {
        setSupplyWETH(tok);
      }
    });
  };

  return (
    <LendContext.Provider
      value={{
        currentAccount,
        network,
        connectWallet,
        supplyEther,
        supplyDAI,
        supplyUSDC,
        supplyUSDT,
        supplyWETH,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
