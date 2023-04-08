const { ethers } = require("hardhat");
const { MAIN_ACCOUNT, INFURA_API_KEY, INFURA_SEPOLIA_API_URL } = process.env;
const axios = require("axios");

const dai = require("../artifacts/contracts/DAIToken.sol/DAIToken.json");
const usdc = require("../artifacts/contracts/USDCToken.sol/USDCToken.json");
const link = require("../artifacts/contracts/LinkToken.sol/LinkToken.json");

// The addresses deployed on Sepolia
let daiAddress = "0xfA36653d85B3A7D06Cd5d83e4d03667b36b44B7a";
let usdcAddress = "0xacEc0F50978654652d089E4e7016D9682a3b27CD";
let linkAddress = "0x9FA894F65353cC2b4feCeA717B998a88a4641255";

const numberToEthers = (number) => {
  return ethers.utils.parseEther(number.toString());
};

// const infuraProvider = new ethers.providers.InfuraProvider(
//   "sepolia",
//   INFURA_API_KEY
// );

// const wallet = new ethers.Wallet(MAIN_ACCOUNT, infuraProvider);
// console.log("Signer Address: " + wallet.address);

recipientAddress = "0x62c21bbd9da59327dee56f6a1312b569c64bb0e0";

options = {
  gasLimit: 300000, // set the gas limit to 100,000
};

const infuraProvider = new ethers.providers.InfuraProvider(
  "sepolia",
  INFURA_API_KEY
);
const wallet = new ethers.Wallet(MAIN_ACCOUNT, infuraProvider);
console.log("Signer Address: " + wallet.address);

const transferToken = async (tokenAddress, tokenAbi) => {
  //   console.log("tokenAddress :" + JSON.stringify(tokenAddress));
  //   console.log("tokenAbi: " + JSON.stringify(tokenAbi));

  let token = new ethers.Contract(tokenAddress, tokenAbi, infuraProvider);

  console.log(
    "Transferring" +
      JSON.stringify(token.address) +
      `to the smart contract ${recipientAddress}`
  );
  const preBalance = await token.balanceOf(recipientAddress);
  console.log("Balance Before Xfer: " + preBalance);

  await token
    .connect(wallet)
    .transfer(recipientAddress, numberToEthers(10), options);

  const postBalance = await token.balanceOf(recipientAddress);
  console.log("Balance After Xfer: " + postBalance);

  console.log("Sleeping for 30 seconds");
};

// Increase the nonce to create a new transaction, if not you will see error below
// reason: 'replacement fee too low', code: 'REPLACEMENT_UNDERPRICED',
async function getNonce(address) {
  const response = await axios.post(INFURA_SEPOLIA_API_URL, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getTransactionCount",
    params: [address, "latest"],
  });
  return response.data.result;
}

const isNonceNew = async (nonce) => {
  // const nonce = await getNonce(wallet.address);
  console.log("pre nonce: " + nonce);
  // await sleep(30000);
  const newNonce = await getNonce(wallet.address);
  console.log("post nonce: " + newNonce);
  if (nonce < newNonce) {
    return true;
  }
  return false;
};

const waitUntilNewNonce = async (nonce) => {
  while (!(await isNonceNew(nonce))) {
    await sleep(30000);
  }
};

const sleep = (ms) => {
  console.log(`sleeping for ${ms}`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

tokenInfo = [
  { token: daiAddress, abi: dai.abi },
  { token: usdcAddress, abi: usdc.abi },
  { token: linkAddress, abi: link.abi },
];

async function transferTokens() {
  for (const { token, abi } of tokenInfo) {
    const nonce = await getNonce(wallet.address);
    await transferToken(token, abi);
    await waitUntilNewNonce(nonce);
  }
}

transferTokens();
