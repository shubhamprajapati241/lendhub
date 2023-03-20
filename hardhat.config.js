require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.6",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: process.env.INFURA_GOERLI_API_URL,
      accounts: [process.env.MAIN_ACCOUNT],
      chainId: 5,
    },
    sepolia: {
      url: process.env.INFURA_SEPOLIA_API_URL,
      accounts: [process.env.MAIN_ACCOUNT],
      chainId: 11155111,
    },

    mumbai: {
      url: process.env.INFURA_MUMBAI_API_URL,
      accounts: [process.env.MAIN_ACCOUNT],
      chainIds: 80001, // mumbai testnet
    },
  },
  // gasReporter: {
  //   enabled: true,
  //   currency: "USD",
  //   coinmarketcap: process.env.COINMARKETCAP,
  //   token: "matic",
  //   outputFile: "gasReports.txt",
  //   noColors: true,
  // },
};
