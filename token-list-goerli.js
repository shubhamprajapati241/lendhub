import { ethIcon, usdcIcon, usdtIcon, daiIcon, wethIcon } from "./assets";

export const token = [
  {
    image: ethIcon,
    name: "ETH",
    decimal: "18",
    apy: 3.18,
    isCollateral: true,
  },

  {
    image: daiIcon,
    name: "DAI",
    address: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
    decimal: "18",
    apy: 3.18,
    isCollateral: false,
  },
  {
    image: usdcIcon,
    name: "USDC",
    address: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
    decimal: "6",
    apy: 3.18,
    isCollateral: false,
  },
  {
    image: usdtIcon,
    name: "USDT",
    address: "0xe802376580c10fe23f027e1e19ed9d54d4c9311e",
    decimal: "6",
    apy: 3.18,
    isCollateral: false,
  },
  {
    image: wethIcon,
    name: "WETH",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    decimal: "18",
    apy: 3.18,
    isCollateral: false,
  },
];
