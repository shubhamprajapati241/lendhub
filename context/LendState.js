import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";

const ERC20ABI = require("./erc20_abi.json");
const addresses = require("../token-list-goerli");

import { ethIcon, usdcIcon, usdtIcon, daiIcon, wethIcon } from "../assets";

// Importing Bank contract details
// import { BankContractAddress } from "../addresses";
import BankContractABI from "../contractAbis/Bank.json";

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
        let currentAddress = account[0];
        setMetamaskDetails({
          provider: provider,
          networkName: networkName,
          signer: signer,
          currentAccount: currentAddress,
        });
        fetchUserAssets(provider, currentAddress, networkName);
      } else {
        return failMessage;
      }
    } catch (e) {
      reportError(error);
    }
  };

  const fetchUserAssets = async (provider, account, networkName) => {
    try {
      const assets = await Promise.all(
        addresses.token.map(async (token) => {
          let tok;
          if (token.name != "ETH") {
            // for localhost network -> token will be 0
            if (networkName != "unknown") {
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
    } catch (error) {
      reportError(error);
    }
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
    //   console.log("supplyAssetsToPool starting....");
    //   console.log("supply name : " + name);
    //   console.log("supply amount : " + amount);
    //   //* connecting with contract
    //   const bankContract = new ethers.Contract(
    //     BankContractAddress,
    //     BankContractABI,
    //     metamaskDetails.signer
    //   );
    //   setContract({ bankContract: bankContract });
    //   const price = ethers.utils.parseUnits(amount, "ether");
    //   //* estimating gas price
    //   const gasLimit = await bankContract.estimateGas.depositAsset(name, {
    //     value: price,
    //   });
    //   let totalGas = (
    //     await metamaskDetails.provider.getFeeData()
    //   ).maxFeePerGas.mul(gasLimit);
    //   totalGas = ethers.utils.formatUnits(totalGas, "ether");
    //   console.log("Total GAS : " + totalGas);
    //   // console.log(estimateGas);
    //   // let gas = parseInt(Number(estimateGas._hex)).toString();
    //   // const gas2 = ethers.utils.parseUnits(gas, "ether");
    //   // console.log(gas2);
    //   // //* Writing the contract
    //   const transcation = await bankContract.depositAsset(name, {
    //     value: price,
    //   });
    //   await transcation.wait();
    //   console.log("Transaction done....");
    //   // //* Reading the contract
    //   // let contractBalance = await bankContract.getContactBalance();
    //   // contractBalance = contractBalance.toString();
    //   // console.log(contractBalance);
  };

  const testApprove = async () => {
    const daiTokenAddress = "0xBa8DCeD3512925e52FE67b1b5329187589072A55";
    const deFiDappAddress = "0xC8e7Ac007078BD3658A79218b28A8598BcBa97A6";
    const amount = ethers.utils.parseEther("10000000");

    try {
      //* Making approve functionality
      const tokenContract = new ethers.Contract(
        daiTokenAddress,
        ERC20ABI,
        metamaskDetails.provider
      );

      const balanceUser = await tokenContract.balanceOf(
        metamaskDetails.currentAccount
      );
      console.log("balanceUser : " + balanceUser);

      const balanceSC = await tokenContract.balanceOf(deFiDappAddress);
      console.log("balanceSC : " + balanceSC);

      console.log(metamaskDetails.currentAccount);

      await tokenContract
        .connect(metamaskDetails.signer)
        .approve(deFiDappAddress, amount);

      console.log("Transaction done....");
    } catch (error) {
      reportError(error);
    }
  };

  const reportError = (error) => {
    console.log(JSON.stringify(error), "red");
  };

  return (
    <LendContext.Provider
      value={{
        metamaskDetails,
        connectWallet,
        metamaskAssets,
        supplyDetails,
        supplyAssetsToPool,
        testApprove,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
