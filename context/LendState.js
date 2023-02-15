import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";

const ERC20ABI = require("./erc20_abi.json");
const addresses = require("../token-list-goerli");

import { ethIcon, usdcIcon, usdtIcon, daiIcon, wethIcon } from "../assets";

// Importing Bank contract details
import { BankContractAddress } from "../addresses";
import BankContactAbi from "../artifacts/contracts/Bank.sol/Bank.json";

const LendState = (props) => {
  //* Declaring all the states

  // Set metamask details
  const [metamaskDetails, setMetamaskDetails] = useState({
    provider: null,
    networkName: null,
    signer: null,
    currentAccount: null,
  });

  //  contract details setting
  const [contract, setContract] = useState({
    bankContract: null,
  });

  // for storing user assets from metamask
  const [metamaskAssets, setMetamaskAssets] = useState([]);

  // for storing user supply assets in the lending pool
  const [supplyDetails, setSupplyDetails] = useState({
    assets: [],
    details: "",
  });

  const connectWallet = async () => {
    const { ethereum } = window;
    const failMessage = "Please install Metamask & connect your Metamask";
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
      const networkName = network.name;
      const signer = provider.getSigner();

      if (account.length) {
        let currentAccount = account[0];
        setMetamaskDetails({
          provider: provider,
          networkName: networkName,
          signer: signer,
          currentAccount: currentAccount,
        });
        fetchUserAssets(provider, currentAccount);
      } else {
        return failMessage;
      }
    } catch (e) {
      console.log("error" + e);
    }
  };

  const fetchUserAssets = async (provider, account) => {
    console.log("fetch user assets");
    console.log(account);
    const assets = await Promise.all(
      addresses.token.map(async (token) => {
        let tok;

        if (token.address) {
          // for localhost network -> token will be 0
          if (metamaskDetails.networkName == "unknown") {
            const tokenContract = new ethers.Contract(
              token.address,
              ERC20ABI,
              provider
            );
            tok = await tokenContract.balanceOf(account);
            tok = ethers.utils.formatUnits(tok, token.decimal);
          } else {
            tok = 0;
          }
        } else {
          tok = await provider.getBalance(account);
          tok = ethers.utils.formatEther(tok);
        }
        let asset = {
          image: token.image,
          name: token.name,
          apy: token.apy,
          isCollateral: token.isCollateral,
          balance: tok,
        };
        return asset;
      })
    );
    setMetamaskAssets(assets);

    fetchSupplyAssets();
  };

  const fetchSupplyAssets = () => {
    let assets = [
      {
        image: ethIcon,
        name: "ETH",
        balance: "100",
        dollarPrice: "300",
        apy: 3.18,
        isCollateral: true,
      },
      {
        image: daiIcon,
        name: "DAI",
        balance: "120",
        dollarPrice: "120",
        apy: "3.18",
        isCollateral: false,
      },
    ];

    let details = {
      totalBalance: "10.603.20",
      totalAPY: "43.61",
      totalCollateral: "10.603.20",
    };

    setSupplyDetails({ assets: assets, details: details });
  };

  const supplyAssetsToPool = async (name, amount) => {
    console.log("supplyAssetsToPool starting....");

    console.log("supply name : " + name);
    console.log("supply amount : " + amount);

    //* connecting with contract
    const bankContract = new ethers.Contract(
      BankContractAddress,
      BankContactAbi.abi,
      metamaskDetails.signer
    );
    setContract({ bankContract: bankContract });
    const price = ethers.utils.parseUnits(amount, "ether");

    //* estimating gas price
    const gasLimit = await bankContract.estimateGas.depositAsset(name, {
      value: price,
    });
    let totalGas = (
      await metamaskDetails.provider.getFeeData()
    ).maxFeePerGas.mul(gasLimit);

    totalGas = ethers.utils.formatUnits(totalGas, "ether");
    console.log("Total GAS : " + totalGas);

    // //* Writing the contract
    const transcation = await bankContract.depositAsset(name, {
      value: price,
    });
    await transcation.wait();
    console.log("Transaction done....");

    // //* Reading the contract
    // let contractBalance = await bankContract.getContactBalance();
    // contractBalance = contractBalance.toString();
    // console.log(contractBalance);
  };

  return (
    <LendContext.Provider
      value={{
        metamaskDetails,
        connectWallet,
        metamaskAssets,
        supplyDetails,
        supplyAssetsToPool,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
