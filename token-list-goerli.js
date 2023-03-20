import { ethIcon, usdcIcon, daiIcon, linkIcon } from "./assets";

// For localhost
import {
  ETHAddress,
  DAITokenAddress,
  USDCTokenAddress,
  LINKTokenAddress,
} from "./addresses";

export const token = [
  {
    image: ethIcon,
    name: "ETH",
    address: ETHAddress,
    decimal: "18",
    apy: 3,
    isCollateral: true,
  },

  {
    image: daiIcon,
    name: "DAI",
    address: DAITokenAddress,
    decimal: "18",
    apy: 3,
    isCollateral: false,
  },
  {
    image: usdcIcon,
    name: "USDC",
    address: USDCTokenAddress,
    decimal: "18",
    apy: 3,
    isCollateral: false,
  },
  {
    image: linkIcon,
    name: "LINK",
    address: LINKTokenAddress,
    decimal: "18",
    apy: 3,
    isCollateral: false,
  },
];

// export const token = [
//   {
//     image: ethIcon,
//     name: "ETH",
//     decimal: "18",
//     apy: 3.18,
//     isCollateral: true,
//   },

//   {
//     image: daiIcon,
//     name: "DAI",
//     address: "0xBa8DCeD3512925e52FE67b1b5329187589072A55",
//     decimal: "18",
//     apy: 3.18,
//     isCollateral: false,
//   },
//   {
//     image: usdcIcon,
//     name: "USDC",
//     address: "0x65aFADD39029741B3b8f0756952C74678c9cEC93",
//     decimal: "6",
//     apy: 3.18,
//     isCollateral: false,
//   },
//   {
//     image: usdtIcon,
//     name: "USDT",
//     address: "0xe802376580c10fe23f027e1e19ed9d54d4c9311e",
//     decimal: "6",
//     apy: 3.18,
//     isCollateral: false,
//   },
//   {
//     image: wethIcon,
//     name: "WETH",
//     address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
//     decimal: "18",
//     apy: 3.18,
//     isCollateral: false,
//   },
// ];
