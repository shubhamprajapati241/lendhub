import React, { useState } from "react";
import LendContext from "./lendContext";
import { ethers } from "ethers";

const ERC20ABI = require("./erc20_abi.json");
const addresses = require("../token-list-goerli");

import { ethIcon, usdcIcon, usdtIcon, daiIcon, wethIcon } from "../assets";

const LendState = (props) => {
  //* Declaring all the states

  // for user account
  const [currentAccount, setCurrentAccount] = useState("");

  // for network
  const [network, setNetwork] = useState("");

  // for storing user assets from metamask
  const [metamaskAssets, setMetamaskAssets] = useState([]);

  // for storing user supply assets in the lending pool
  const [supplyAssets, setSupplyAssets] = useState([]);

  const [supplyDetails, setSupplyDetails] = useState({});

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
    const assets = await Promise.all(
      addresses.token.map(async (token) => {
        let tok;

        if (token.address) {
          const tokenContract = await new ethers.Contract(
            token.address,
            ERC20ABI,
            provider
          );
          tok = await tokenContract.balanceOf(account);
          tok = ethers.utils.formatUnits(tok, token.decimal);
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
    const assets = [
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

    const detailsOfSupply = {
      totalBalance: "10.603.20",
      totalAPY: "43.61",
      totalCollateral: "10.603.20",
    };

    setSupplyAssets(assets);
    setSupplyDetails(detailsOfSupply);
  };

  return (
    <LendContext.Provider
      value={{
        currentAccount,
        network,
        connectWallet,
        metamaskAssets,
        supplyAssets,
        supplyDetails,
      }}
    >
      {props.children}
    </LendContext.Provider>
  );
};

export default LendState;
