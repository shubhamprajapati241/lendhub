import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";

const ERC20ABI = require("./erc20_abi.json");
const WRAPPED_ETHER_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const DAI_ADDRESS = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
const USDC_ADDRESS = "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C";
const USDT_ADDRESS = "0xe802376580c10fe23f027e1e19ed9d54d4c9311e";

const LendState = (props) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [network, setNetwork] = useState("");

  // for user supply assets
  const [supplyEther, setSupplyEther] = useState(0);
  const [supplyDAI, setSupplyDAI] = useState(0);
  const [supplyUSDC, setSupplyUSDC] = useState(0);
  const [supplyUSDT, setSupplyUSDT] = useState(0);

  const [supplyTokensArray, setSupplyTokensArray] = useState([]);

  const failMessage = "Please install Metamask & connect your Metamask";
  const successMessage = "Account Connected Successfully";

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

      if (account.length) {
        setCurrentAccount(account[0]);
        setNetwork(network.name);
        fetchUserAssets(provider, account[0]);
      } else {
        return failMessage;
      }
    } catch (e) {
      console.log("error" + e);
    }
  };

  const fetchUserAssets = async (provider, account) => {
    //* 1. Getting supply ethers
    let eth;
    eth = await provider.getBalance(account);
    eth = ethers.utils.formatEther(eth);
    setSupplyEther(eth);
    console.log("supply Ethers " + eth);
    supplyTokensArray.push(["eth", "ETH", eth, true]);

    //* 2. Getting DAI balance
    let dai;
    const daiTokenContract = await new ethers.Contract(
      DAI_ADDRESS,
      ERC20ABI,
      provider
    );
    dai = await daiTokenContract.balanceOf(account);
    dai = ethers.utils.formatEther(dai, 18);
    console.log("supply DAI " + dai);
    setSupplyDAI(dai);

    //* 3. Getting USDC balance
    let usdc;
    const usdcTokenContract = await new ethers.Contract(
      USDC_ADDRESS,
      ERC20ABI,
      provider
    );
    let usdc2 = await usdcTokenContract.balanceOf(account);
    usdc = ethers.utils.formatUnits(usdc2, 6);
    setSupplyUSDC(usdc);
    console.log("supply USDC tokens : " + usdc);

    //* 4. Getting USDT balance
    let usdt;
    const usdtTokenContract = await new ethers.Contract(
      USDT_ADDRESS,
      ERC20ABI,
      provider
    );
    usdt = await usdtTokenContract.balanceOf(account);
    usdt = ethers.utils.formatUnits(usdt, 6);
    setSupplyUSDT(usdt);
    console.log("supply USDT tokens : " + usdt);
  };

  return (
    <LendContext.Provider
      value={{
        currentAccount,
        connectWallet,
        supplyEther,
        supplyDAI,
        supplyUSDC,
        supplyUSDT,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
