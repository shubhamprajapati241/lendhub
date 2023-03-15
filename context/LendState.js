import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";

// TODO : use in Goerli
// const TokenABI = require("./contractAbis/tokenAbi.json");
// const LendingPoolABI = require("./contractAbis/lendingPoolAbi.json");
// const LendingConfigABI = require("./contractAbis/lendingConfigAbi.json");
// const AddressToTokenMapABI = require("./contractAbis/addressToTokenMapAbi.json");

const TokenABI = require("../artifacts/contracts/DAIToken.sol/DAIToken.json");
const LendingPoolABI = require("../artifacts/contracts/LendingPool.sol/LendingPool.json");
const LendingConfigABI = require("../artifacts/contracts/LendingConfig.sol/LendingConfig.json");
const AddressToTokenMapABI = require("../artifacts/contracts/AddressToTokenMap.sol/AddressToTokenMap.json");

const tokensList = require("../token-list-goerli");

import { ethIcon, usdcIcon, usdtIcon, daiIcon, wethIcon } from "../assets";

// Importing Bank contract details
import {
  BankContractAddress,
  DAITokenAddress,
  LINKTokenAddress,
  USDCTokenAddress,
  AddressToTokenMapAddress,
  LendingConfigAddress,
  LendingPoolAddress,
} from "../addresses";
import BankContractABI from "./contractAbis/Bank.json";

const numberToEthers = (number) => {
  return ethers.utils.parseEther(number.toString());
};

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

        console.log("Connected to wallet....");
        fetchUserAssets(provider, currentAddress, networkName);
      } else {
        return failMessage;
      }
    } catch (error) {
      reportError(error);
    }
  };

  const fetchUserAssets = async (provider, account, networkName) => {
    try {
      const assets = await Promise.all(
        tokensList.token.map(async (token) => {
          let tok;
          console.log(token.name + " : " + token.address);
          if (token.name != "ETH") {
            const tokenContract = new ethers.Contract(
              token.address,
              TokenABI,
              provider
            );

            tok = await tokenContract.balanceOf(account);
            tok = token ? ethers.utils.formatUnits(tok, token.decimal) : 0;
          } else {
            tok = await provider.getBalance(account);
            tok = ethers.utils.formatEther(tok);
          }
          let asset = {
            image: token.image,
            address: token.address,
            name: token.name,
            apy: token.apy,
            isCollateral: token.isCollateral,
            balance: tok,
          };
          return asset;
        })
      );
      setMetamaskAssets(assets);
      fetchLendAssets(account);
    } catch (error) {
      reportError(error);
    }
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

  const getContract = async (address, abi) => {
    const contract = new ethers.Contract(
      address,
      abi.abi,
      metamaskDetails.provider
    );
    return contract;
  };

  const testApprove = async () => {
    // const daiTokenAddress = "0xBa8DCeD3512925e52FE67b1b5329187589072A55";
    // const deFiDappAddress = "0xC8e7Ac007078BD3658A79218b28A8598BcBa97A6";
    // const amount = ethers.utils.parseEther("10000000");
    // try {
    //   //* Making approve functionality
    //   const tokenContract = new ethers.Contract(
    //     daiTokenAddress,
    //     TokenABI,
    //     metamaskDetails.provider
    //   );
    //   const balanceUser = await tokenContract.balanceOf(
    //     metamaskDetails.currentAccount
    //   );
    //   console.log("balanceUser : " + balanceUser);
    //   const balanceSC = await tokenContract.balanceOf(deFiDappAddress);
    //   console.log("balanceSC : " + balanceSC);
    //   console.log(metamaskDetails.currentAccount);
    //   await tokenContract
    //     .connect(metamaskDetails.signer)
    //     .approve(deFiDappAddress, amount);
    //   return true;
    // } catch (error) {
    //   reportError(error);
    // }
  };

  /**************************** APPROVE TOKENS ************************************/
  const ApproveToContinue = async (tokenAddress, approveAmount) => {
    const amount = ethers.utils.parseEther(approveAmount);
    console.log("tokenAddress : " + tokenAddress);
    console.log("LendingPoolAddress : " + LendingPoolAddress);
    console.log("approveAmount : " + amount);

    try {
      const contract = await getContract(tokenAddress, TokenABI);
      const transaction = await contract
        .connect(metamaskDetails.signer)
        .approve(LendingPoolAddress, amount);
      await transaction.wait();
      console.log("Approve Transaction done....");
      return true;
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  /*************************** Lend Functionality ***************************/
  const LendAsset = async (token, supplyAmount) => {
    console.log("Lending....");
    const amount = numberToEthers(supplyAmount);
    const valueOption = { value: amount };
    console.log("token : " + token);
    console.log("supplyAmount : " + amount);

    try {
      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      const transaction = await contract
        .connect(metamaskDetails.signer)
        .lend(token, amount, valueOption);

      await transaction.wait();
      console.log("Supply Transaction done....");
      fetchLendAssets(metamaskDetails.currentAccount);
      return true;
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  // const structuredAssets = (assets) => {
  //   return assets.map((asset) => ({
  //     token: asset.token,
  //     balance: Number(asset.lentQty),
  //     apy: Number(asset.lentApy),
  //   }));
  // };

  /*************************** Component : Your Supplies ***************************/
  const fetchLendAssets = async (account) => {
    console.log("Fetching Supply assets");
    try {
      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      const assets = await contract.getLenderAssets(account);

      const ass = assets.map((asset) => ({
        token: asset.token,
        balance: Number(asset.lentQty),
        apy: Number(asset.lentApy),
      }));

      console.log(ass);

      console.log("Lender Supply Assets");
      // console.log(assets);
      console.log("Supply Transaction done....");
      // return true;
    } catch (error) {
      reportError(error);
      return error;
    }
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

  const getAssets = async () => {
    console.log("Getting assets");
    try {
      const contract = await getContract(
        LendingConfigAddress,
        LendingConfigABI
      );

      const assets = await contract.getAssets();

      // const ass = assets.map((asset) => ({
      //   token: asset.token,
      //   balance: Number(asset.lentQty),
      //   apy: Number(asset.lentApy),
      // }));

      console.log(assets);
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  const reportError = (error) => {
    console.error(JSON.stringify(error));
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
        ApproveToContinue,
        LendAsset,
        getAssets,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
