## Table of Contents
- [Introduction](#introduction)
- [Technology Stack](#technology-stack)
- [Project Layout](#project-layout)
    * [Top Level folders](#top-level-folders)
    * [Important Files](#important-files)
- [Using & Testing LendHub on Sepolia](#using--testing-lendhub-on-sepolia)
- [Cloning and Deploying the Dapp on Sepolia Testnet](#cloning-and-deploying-the-dapp-on-sepolia-testnet)
- [Bootsrapping & running this project on your localhost using Hardhat](#bootsrapping--running-this-project-on-your-localhost-using-hardhat)

## Get FREE Sepolia ETH for testing the App
- [Infura Sepolia Faucet](https://www.infura.io/faucet)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com)
- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de)


## Introduction
LendHub is a comprehensive DeFi Lending & Borrowing decentralized application (DApp) operating on **Ethereum's Sepolia Testnet**. The platform facilitates lending and borrowing of various crypto assets, while offering opportunities to earn passive income as interest on deposited funds.

This fully on-chain DeFi app allows users to effortlessly deposit their coins (ETH) or tokens into the smart contract, and receive rewards based on the amount of tokens they supply. In addition, LendHub enables users to borrow tokens, making it a versatile and user-friendly platform for all crypto enthusiasts.

## Technology Stack

- Built on Ethereum Blockchain
- Solidity
- Javascript
- Typescript
- Chainlink Price Oracles
- Openzeppelin (ERC20 Tokens, Ownable, Reentrancy Guards)
- Hardhat
- Etherjs
- Metamask
- Infura Web3API
- Next JS
- Tailwind CSS
- HTML
- Slither, Mythril, Echidna

## Project Layout
### Top Level folders
1. /components - contains the front-end application
2. /context - contains the front-end application wrapper javascript
3. /contracts - contains the solidity contract
4. /scripts - deployment scripts
5. /pages - Next Js Main rendering pages and components 
6. /tests - contains tests for the solidity contracts
### Important Files
1. package.json - node modules to be installed, etc.
2. hardhat.config.js - solidity version and run information, deployment network configuration 
3. addresses.js - addresses exported for use use with hardhat local installed contracts
4. .env - To store Infura/Alchemy API keys and your private key

## Using & Testing LendHub on Sepolia

1. Metamask : Install Metamask wallet extension on your browser ( Chrome recommended ) - The App will prompt you to install one if it is not.

   [Click to Download and install Metamask on your browser](https://metamask.io/download/)

2. Add Sepolia Testnet to MetaMask

   ***To add the Sepolia testnet to MetaMask, click the network button at the top of your wallet and click “Add Network”***

   <img src="https://user-images.githubusercontent.com/61042463/226925417-a59f11d7-dc25-4167-b4c6-508793327abd.png" width="400" height="400">

   ***Under the Networks, at the bottom of the page, click “Add a network manually”***

   <img src="https://user-images.githubusercontent.com/61042463/226925715-26272ad1-ce26-46c0-9140-c8f523d25cd8.png" width="700" height="350">

   ***Add network configuration details along with the following information***

   ```
   Network name : Sepolia test network
   New RPC URL : https://sepolia.infura.io/v3/
   Chain ID : 11155111
   Currency symbol : SepoliaETH
   Block explorer URL : https://sepolia.etherscan.io
   ```
   ***See image below for reference***
   
   ![image](https://user-images.githubusercontent.com/61042463/226937721-785bb706-b21d-4291-9dcc-357d1d97ed4d.png)


3. Get Some Sepolia ETH from the Faucets below for testing the App
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com)
- [PoW based faucet](https://sepolia-faucet.pk910.de/) 

4. If you need DAI, LINK & USDC tokens for testing email our admin

5. Using/Testing the App
- Visit https://lendhub.netlify.app and start testing

![image](https://user-images.githubusercontent.com/3410735/227120829-ce4d8ff3-cad2-46cd-817a-d86778920027.png)


## Cloning and Deploying the Dapp on Sepolia Testnet
1. Clone this repo :

```
git clone https://github.com/shubhamprajapati241/lendhub.git
```

2. Go to the root directory and install all node packages

```
cd lendhub
npm install
```

5. Infura API key
   [Follow this article to get Infura API key](https://medium.com/jelly-market/how-to-get-infura-api-key-e7d552dd396f)

   ***Select Sepolia testnet and copy the url***

   ![image](https://user-images.githubusercontent.com/61042463/226934039-519747cb-acbb-4403-893f-2c78c2d33bcd.png)

6. Get Your Metamask wallet private key : https://support.metamask.io/hc/en-us/articles/360015289632

7. Create a new .env file in the root directory

   ***Paste the Infura Sepolia API key and your metmask accounts private key into .env file***

   ![env](https://user-images.githubusercontent.com/61042463/226642196-965329ef-6c17-43ab-9268-a243f9f04728.png)

8. Deploy the Dapp on Sepolia Testnet

```
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

9. Add the sepolia deploy addresses into ***address.js*** file

![addresses-sepolia](https://user-images.githubusercontent.com/61042463/226643306-69d6d9cc-67d7-4b2a-9c8a-694a23501260.png)

10. Start NextJs Node Server

```
npm run dev
```

## Bootsrapping & running this project on your localhost using Hardhat
Following steps show to get this project on to your machine and bring it up:

1. Metamask : Install Metamask wallet extension on your browser ( Chrome recommended ) - The App will prompt you to install one if it is not.

   [Click to Download and install Metamask on your browser](https://metamask.io/download/)


2. Clone this repo :

```
git clone https://github.com/shubhamprajapati241/lendhub.git
```

3. Go to the root directory and install dependent node packages

```
cd lendhub
npm install
```

4. Compile, Test and Run the hardhat node

```
 npx hardhat compile
 npx hardhat test
 npx hardhat node
```

5. Deploy on the Hardhat localhost

```
npx hardhat run scripts/deploy.js --network localhost
```

6. Add the localhost deploy addresses into ***address.js*** file

![addresses](https://user-images.githubusercontent.com/61042463/226641194-637954ff-8230-4e41-82f0-3e42bb5dbdfe.png)

7. Start the NextJs Node Server. Open http://localhost:3000 to view it in your browser.

```
npm run dev
```
8. To run hardhat tests to verify the working of Dapp, run the script below

```
npx hardhat test
```
