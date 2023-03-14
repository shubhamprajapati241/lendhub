import { ethIcon, usdcIcon, usdtIcon, daiIcon, wethIcon } from "./assets";

export const token = [
  {
    image: ethIcon,
    name: "ETH",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    decimal: "18",
    apy: 3.18,
    isCollateral: true,
  },

  {
    image: daiIcon,
    name: "DAI",
    address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    decimal: "18",
    apy: 3.18,
    isCollateral: false,
  },
  {
    image: usdcIcon,
    name: "USDC",
    address: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0",
    decimal: "18",
    apy: 3.18,
    isCollateral: false,
  },
  // {
  //   image: usdtIcon,
  //   name: "USDT",
  //   address: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  //   decimal: "6",
  //   apy: 3.18,
  //   isCollateral: false,
  // },
  // {
  //   image: wethIcon,
  //   name: "WETH",
  //   address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  //   decimal: "18",
  //   apy: 3.18,
  //   isCollateral: false,
  // },
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
