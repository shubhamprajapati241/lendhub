import React, { useEffect, useState } from "react";
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

// Importing Bank contract details
import {
  DAITokenAddress,
  LINKTokenAddress,
  USDCTokenAddress,
  AddressToTokenMapAddress,
  LendingConfigAddress,
  LendingPoolAddress,
  ETHAddress,
} from "../addresses";

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

  const [userAssets, setUserAssets] = useState([]);
  const [supplyAssets, setSupplyAssets] = useState([]);

  //  contract details setting
  const [contract, setContract] = useState({
    bankContract: null,
  });

  // for storing user supply assets in the lending pool
  const [supplySummary, setSupplySummary] = useState({
    totalUSDBalance: 0,
    weightedAvgAPY: 0,
    totalUSDCollateral: 0,
  });

  const connectWallet = async () => {
    console.warn("Connecting to wallet...");
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
        console.warn("Connected to wallet....");
      } else {
        return failMessage;
      }
    } catch (error) {
      reportError(error);
    }
  };

  const getUserAssets = async () => {
    console.warn("Getting user Assets...");
    try {
      const assets = await Promise.all(
        tokensList.token.map(async (token) => {
          let tok;

          if (token.name != "ETH") {
            // TODO : getContract()
            // 2. Toke
            const tokenContract = new ethers.Contract(
              token.address,
              TokenABI.abi,
              metamaskDetails.provider
            );
            tok = await tokenContract.balanceOf(metamaskDetails.currentAccount);
            tok = token ? ethers.utils.formatUnits(tok, token.decimal) : 0;
          } else {
            tok = await metamaskDetails.provider.getBalance(
              metamaskDetails.currentAccount
            );
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

      setUserAssets(assets);

      return assets;
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
      getSupplyAssets(metamaskDetails.currentAccount);
      return true;
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  /*************************** Withdraw Functionality Start ***************************/
  const WithdrawAsset = async (tokenAddress, withdrawAmount) => {
    const amount = numberToEthers(withdrawAmount);
    const valueOption = { value: amount };

    console.log("Withdraw Started.....");
    console.log("tokenAddress : " + tokenAddress);
    console.log("withdrawAmount : " + amount);

    // TODO : make a connection once
    try {
      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      const transaction = await contract
        .connect(metamaskDetails.signer)
        .withdraw(tokenAddress, amount);
      await transaction.wait();
      console.log("Withdraw done....");
      return true;
    } catch (error) {
      reportError(error);
      return error;
    }
  };
  /*************************** Withdraw Functionality End ***************************/

  const structuredAssets2 = (assets) => {
    console.log("In structuredAssets2....");
    console.log(assets);
    var result = tokensList.token
      .filter((tokenList) => {
        return assets.some((assetList) => {
          return tokenList.address == assetList.token;
        });
      })
      .map((itm) => ({
        ...assets.find((item) => item.token === itm.address && item),
        ...itm,
      }));
    return result;
  };

  const structuredAssets = async (assets) => {
    console.log("In Structured Assets..........");
    const assetsList = [];

    for (let i = 0; i < assets.length; i++) {
      const token = assets[i].token;
      const lendQty = assets[i].lentQty;

      console.log(lendQty);
      const amountInUSD = await getAmountInUSD(token, lendQty);
      assetsList.push({
        token: assets[i].token,
        balance: Number(assets[i].lentQty) / 1e18,
        apy: Number(assets[i].lentApy),
        balanceInUSD: amountInUSD,
      });
    }

    console.log(assetsList);
    return assetsList;
  };

  const getAmountInUSD = async (address, amount) => {
    console.log("Getting amount in USD......");
    console.log("amount" + amount);
    const AMOUNT = numberToEthers(amount);
    console.log("AMOUNT" + AMOUNT);

    try {
      const contract = new ethers.Contract(
        LendingPoolAddress,
        LendingPoolABI.abi,
        metamaskDetails.provider
      );
      const amountInUSD =
        Number(await contract.getAmountInUSD(address, AMOUNT)) / 1e18;

      console.log("amountInUSD : " + amountInUSD);
      return amountInUSD;
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  /*************************** Component : Your Supplies ***************************/
  const getSupplyAssets = async () => {
    console.warn("Getting Supply assets.......");

    try {
      const contract = new ethers.Contract(
        LendingPoolAddress,
        LendingPoolABI.abi,
        metamaskDetails.provider
      );

      // const contract = getContract(LendingPoolAddress, LendingPoolABI);
      const assets = await contract.getLenderAssets(
        metamaskDetails.currentAccount
      );

      const supplyAssets = await structuredAssets(assets);

      console.log(supplyAssets);
      const supplyAsset2 = structuredAssets2(supplyAssets);
      console.log(JSON.stringify(supplyAsset2));

      const totalUSDBalance = supplyAssets.reduce((bal, item) => {
        return bal + item.balanceInUSD;
      }, 0);

      const weightedAvgAPY = supplyAssets.reduce((bal, item) => {
        return bal + item.apy;
      }, 0);

      const totalUSDCollateral = supplyAssets
        .filter((asset) => asset.token == ETHAddress)
        .reduce((bal, item) => {
          return bal + item.balanceInUSD;
        }, 0);

      let summary = {
        totalUSDBalance: totalUSDBalance,
        weightedAvgAPY: weightedAvgAPY / supplyAssets.length,
        totalUSDCollateral: totalUSDCollateral,
      };

      setSupplySummary(summary);
      setSupplyAssets(supplyAsset2);
      console.log("Got Supply assets.....");
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  const getAssets = async () => {
    console.log("Getting assets");
    try {
      const contract = await getContract(
        LendingConfigAddress,
        LendingConfigABI
      );
      const assets = await contract.getAssets();
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
        getUserAssets,
        supplySummary,
        supplyAssetsToPool,
        testApprove,
        ApproveToContinue,
        LendAsset,
        getAssets,
        userAssets,
        getSupplyAssets,
        supplyAssets,
        getAmountInUSD,
        numberToEthers,
        WithdrawAsset,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
