import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";
const tokensList = require("../token-list-goerli");

// TODO : uncomment for sepolia
const TokenABI = require("../abis/DAIToken.json");
const LendingPoolABI = require("../abis/LendingPool.json");
const LendingHelperABI = require("../abis/LendingHelper.json");

// TODO : uncomment for localhost
// const TokenABI = require("../artifacts/contracts/DAIToken.sol/DAIToken.json");
// const LendingPoolABI = require("../artifacts/contracts/LendingPool.sol/LendingPool.json");
// const LendingHelperABI = require("../artifacts/contracts/LendingHelper.sol/LendingHelper.json");

// Importing Bank contract details
import {
  ETHAddress,
  LendingPoolAddress,
  LendingHelperAddress,
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
  const [assetsToBorrow, setAssetsToBorrow] = useState([]);
  const [yourBorrows, setYourBorrows] = useState([]);

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

  const [borrowSummary, setBorrowSummary] = useState({
    totalUSDBalance: 0,
    weightedAvgAPY: 0,
    totalBorrowPowerUsed: 0,
  });

  const connectWallet = async () => {
    console.log("1. Connecting to wallet...");
    const { ethereum } = window;
    const failMessage = "Please install Metamask & connect your Metamask";
    try {
      if (!ethereum) return; // console.log(failMessage);
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

      if (networkName != "sepolia") {
        alert("Please switch your network to Sepolia Testnet");
        return;
      }

      if (account.length) {
        let currentAddress = account[0];
        setMetamaskDetails({
          provider: provider,
          networkName: networkName,
          signer: signer,
          currentAccount: currentAddress,
        });
        console.log("Connected to wallet....");
      } else {
        alert(failMessage);
        return;
      }
    } catch (error) {
      reportError(error);
    }
  };

  const getUserAssets = async () => {
    console.log("2. Getting Assets to supply...");
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
      console.log("Got Assets to supply...");
      console.log(JSON.stringify(assets));
      return assets;
    } catch (error) {
      reportError(error);
    }
  };

  const supplyAssetsToPool = async (name, amount) => {
    //   // console.log("supplyAssetsToPool starting....");
    //   // console.log("supply name : " + name);
    //   // console.log("supply amount : " + amount);
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
    //   // console.log("Total GAS : " + totalGas);
    //   // // console.log(estimateGas);
    //   // let gas = parseInt(Number(estimateGas._hex)).toString();
    //   // const gas2 = ethers.utils.parseUnits(gas, "ether");
    //   // // console.log(gas2);
    //   // //* Writing the contract
    //   const transcation = await bankContract.depositAsset(name, {
    //     value: price,
    //   });
    //   await transcation.wait();
    //   // console.log("Transaction done....");
    //   // //* Reading the contract
    //   // let contractBalance = await bankContract.getContactBalance();
    //   // contractBalance = contractBalance.toString();
    //   // // console.log(contractBalance);
  };

  const getContract = async (address, abi) => {
    const contract = new ethers.Contract(
      address,
      abi.abi,
      metamaskDetails.provider
    );
    return contract;
  };

  /**************************** APPROVE TOKENS ************************************/
  const ApproveToContinue = async (tokenAddress, approveAmount) => {
    const amount = numberToEthers(approveAmount);

    console.log(
      "****Approving token : " +
        tokenAddress +
        "| supplyAmount : " +
        approveAmount
    );

    try {
      const contract = await getContract(tokenAddress, TokenABI);
      const transaction = await contract
        .connect(metamaskDetails.signer)
        .approve(LendingPoolAddress, amount);
      await transaction.wait();
      console.log("Token Approved....");
      return { status: 200, message: "Transaction Successful..." };
    } catch (error) {
      reportError(error);
      return { status: 500, message: error.reason };
    }
  };

  /*************************** Lend Functionality ***************************/
  const LendAsset = async (token, supplyAmount) => {
    try {
      const amount = numberToEthers(supplyAmount);
      const valueOption = { value: amount };
      console.warn(
        "***Lending token : " + token + "| supplyAmount : " + supplyAmount
      );
      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      console.log(contract);
      let transaction;
      if (token == ETHAddress) {
        transaction = await contract
          .connect(metamaskDetails.signer)
          .lend(token, amount, valueOption);
      } else {
        transaction = await contract
          .connect(metamaskDetails.signer)
          .lend(token, amount);
      }
      await transaction.wait();
      return { status: 200, message: "Transaction Successful.." };
    } catch (error) {
      reportError(error);
      return { status: 500, message: error.reason };
    }
  };

  /*************************** Withdraw Functionality ***************************/
  const WithdrawAsset = async (tokenAddress, withdrawAmount) => {
    try {
      const amount = numberToEthers(withdrawAmount);
      console.log(
        "***Withdrawing token : " +
          tokenAddress +
          "| withdrawAmount : " +
          withdrawAmount
      );
      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      const transaction = await contract
        .connect(metamaskDetails.signer)
        .withdraw(tokenAddress, amount);
      await transaction.wait();
      console.log("Token Withdrawn....");
      return { status: 200, message: "Transaction Successful.." };
    } catch (error) {
      reportError(error);
      return { status: 500, message: error.reason };
    }
  };

  const objectifySuppliedAssets = async (assets) => {
    const assetsList = [];
    for (let i = 0; i < assets.length; i++) {
      const token = assets[i].token;
      let lendQty = assets[i].lentQty;

      const amountInUSD = await getAmountInUSD(token, lendQty);
      lendQty = Number(assets[i].lentQty) / 1e18;

      const maxSupplyAmount = await getUserTotalAvailableBalance();

      const maxQty = await getTokensPerUSDAmount(token, maxSupplyAmount);

      const qty = lendQty <= maxQty ? lendQty : maxQty;

      console.log("lendQty" + lendQty);
      console.log("maxQty" + maxQty);
      console.log("maxSupplyAmount" + maxSupplyAmount);

      assetsList.push({
        token: assets[i].token,
        balance: lendQty,
        apy: Number(assets[i].lentApy),
        balanceInUSD: amountInUSD,
        maxSupply: qty,
      });
    }

    console.log("**********objectifySuppliedAssets");
    console.log(assetsList);
    return assetsList;
  };

  const objectifyBorrowedAssets = async (assets) => {
    // console.log("*** In objectifyBorrowedAssets ***");
    const borrowsList = [];

    // console.log(assets);

    for (let i = 0; i < assets.length; i++) {
      const token = assets[i].token;
      const borrowQty = assets[i].borrowQty;
      const borrowApy = assets[i].borrowApy;
      const amountInUSD = await getAmountInUSD(token, borrowQty);
      borrowsList.push({
        token: token,
        borrowQty: Number(borrowQty),
        borrowApy: Number(borrowApy),
        borrowedBalInUSD: amountInUSD,
      });
    }

    // console.log("**** objectifyBorrowedAssets");
    // console.log(borrowsList);
    return borrowsList;
  };

  const mergeObjectifiedAssets = (assets) => {
    // console.log("*** In mergeObjectifiedAssets....");
    //  console.log(assets);
    var result = tokensList.token
      .filter((tokenList) => {
        return assets.some((assetList) => {
          return tokenList.address == assetList.token;
        });
      })
      .map((assetObj) => ({
        ...assets.find((item) => item.token === assetObj.address && item),
        ...assetObj,
      }));
    // console.log(result);
    return result;
  };

  const getAmountInUSD = async (address, amount) => {
    // console.log("Getting amount in USD......");
    // console.log("amount" + amount);

    // console.log("AMOUNT" + AMOUNT);

    try {
      const AMOUNT = numberToEthers(amount);
      const contract = new ethers.Contract(
        LendingHelperAddress,
        LendingHelperABI.abi,
        metamaskDetails.provider
      );
      const amountInUSD =
        Number(await contract.getAmountInUSD(address, AMOUNT)) / 1e18;

      // console.log("amountInUSD : " + amountInUSD);
      return amountInUSD;
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  const getUserTotalAvailableBalance = async () => {
    try {
      const contract = new ethers.Contract(
        LendingPoolAddress,
        LendingPoolABI.abi,
        metamaskDetails.provider
      );
      const maxAmount = await contract.getUserTotalAvailableBalanceInUSD(
        metamaskDetails.currentAccount,
        1
      );

      return Number(maxAmount);
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  const getTokensPerUSDAmount = async (token, amount) => {
    try {
      const contract = new ethers.Contract(
        LendingHelperAddress,
        LendingHelperABI.abi,
        metamaskDetails.provider
      );
      const maxQty = Number(
        await contract.getTokensPerUSDAmount(token, amount)
      );

      return maxQty;
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  /*************************** Component : Your Supplies ***************************/
  const getYourSupplies = async () => {
    console.log("3. Getting your Supplies...");

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

      const supplyAssets = await objectifySuppliedAssets(assets);

      console.log(supplyAssets);

      const supplyAsset2 = mergeObjectifiedAssets(supplyAssets);
      // console.log(JSON.stringify(supplyAsset2));

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

      console.log("Got your supplies...");
      console.log(JSON.stringify(supplyAsset2));
      setSupplySummary(summary);
      setSupplyAssets(supplyAsset2);
      // // console.log("Got Supply assets.....");
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  /************ Function to get Assets to Borrow ***********/
  const getAssetsToBorrow = async () => {
    console.log("4. Getting assets to Borrow...");

    try {
      const contract = new ethers.Contract(
        LendingPoolAddress,
        LendingPoolABI.abi,
        metamaskDetails.provider
      );

      // const contract = getContract(LendingPoolAddress, LendingPoolABI);
      const assetsToBorrow = await contract.getAssetsToBorrow(
        metamaskDetails.currentAccount
      );

      // console.log("*** calling objectifyBorrowedAssets from getAssetsToBorrow");
      const assetsToBorrowObject = await objectifyBorrowedAssets(
        assetsToBorrow
      );
      // console.log(JSON.stringify(assetsToBorrowObject));

      // console.log("*** calling mergeObjectifiedAssets from getAssetsToBorrow");
      const assetsToBorrowObjectMerged =
        mergeObjectifiedAssets(assetsToBorrowObject);

      console.log("Got assets to borow...");
      console.log(JSON.stringify(assetsToBorrowObjectMerged));
      setAssetsToBorrow(assetsToBorrowObjectMerged);
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  /*************************** Borrow Functionality ***************************/
  const borrowAsset = async (token, borrowAmount) => {
    try {
      const amount = numberToEthers(borrowAmount);
      console.log(
        "***Borrowing token : " + token + "| borrowAmount : " + borrowAmount
      );
      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      const transaction = await contract
        .connect(metamaskDetails.signer)
        .borrow(token, amount);
      await transaction.wait();

      console.log("Token Borrowed...");
      return { status: 200, message: "Transaction Successful.." };
    } catch (error) {
      reportError(error);
      return { status: 500, message: error.reason };
    }
  };

  /*************************** Your Borrows ***************************/
  const getYourBorrows = async () => {
    console.log("4. Getting Your Borrows");
    try {
      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      const yourBorrows = await contract
        .connect(metamaskDetails.signer)
        .getBorrowerAssets(metamaskDetails.currentAccount);

      // console.log("*** calling objectifyBorrowedAssets from getYourBorrows");
      const yourBorrowsObject = await objectifyBorrowedAssets(yourBorrows);
      // console.log(yourBorrowsObject);
      // console.log("*** calling mergeObjectifiedAssets from getYourBorrows");
      const yourBorrowsObjectMerged = mergeObjectifiedAssets(yourBorrowsObject);
      console.log(JSON.stringify(yourBorrowsObjectMerged));

      const totalUSDBalanceBorrowed = yourBorrowsObjectMerged.reduce(
        (bal, item) => {
          return bal + item.borrowedBalInUSD;
        },
        0
      );
      const weightedAvgAPY = yourBorrowsObjectMerged.reduce((bal, item) => {
        return bal + item.borrowApy;
      }, 0);

      const totalBorrowPowerUsed = totalUSDBalanceBorrowed;

      let summary = {
        totalUSDBalance: totalUSDBalanceBorrowed,
        weightedAvgAPY: weightedAvgAPY / yourBorrowsObjectMerged.length,
        totalBorrowPowerUsed: totalBorrowPowerUsed,
      };

      setBorrowSummary(summary);
      setYourBorrows(yourBorrowsObjectMerged);

      console.log("***Got your borrows");
      console.log(JSON.stringify(yourBorrowsObjectMerged));
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  /*************************** Functions for the borrow ***************************/
  const repayAsset = async (tokenAddress, repayAmount) => {
    try {
      const amount = numberToEthers(repayAmount);
      console.log(
        "****Repaying token : " +
          tokenAddress +
          "| repayAmount : " +
          repayAmount
      );

      const contract = await getContract(LendingPoolAddress, LendingPoolABI);
      const transaction = await contract
        .connect(metamaskDetails.signer)
        .repay(tokenAddress, amount);
      await transaction.wait();
      console.log("Token Repaid....");
      return { status: 200, message: "Transaction Successful.." };
    } catch (error) {
      reportError(error);
      return { status: 500, message: error.reason };
    }
  };

  const updateInterests = async () => {
    // console.error("Updating interests.....");
    try {
      // const account = metamaskDetails.currentAccount;

      // console.log("account : " + account);

      // const contract = await getContract(LendingPoolAddress, LendingPoolABI);

      // const updateEarnedInterest = await contract.interestEarned(account);

      // await updateEarnedInterest.wait();

      // console.log(updateEarnedInterest);

      // const updateAccruedInterestOnBorrow =
      //   await contract.updateAccruedInterestOnBorrow(account);
      // await updateAccruedInterestOnBorrow.wait();

      console.log("Updated interests.....");
    } catch (error) {
      reportError(error);
      return error;
    }
  };

  // ------------------
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
        ApproveToContinue,
        LendAsset,
        userAssets,
        getYourSupplies,
        supplyAssets,
        getAmountInUSD,
        numberToEthers,
        WithdrawAsset,
        getAssetsToBorrow,
        assetsToBorrow,
        borrowAsset,
        getYourBorrows,
        yourBorrows,
        repayAsset,
        borrowSummary,
        updateInterests,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
