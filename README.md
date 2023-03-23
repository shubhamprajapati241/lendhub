##### Table of Contents  
## DeFi-Lending-and-Borrowing DApp

DeFi Lending platform which lets you lend, borrow crypto assets and helps you earn some passive income as interest on your deposits.

A full stack, fully-onchain DeFi app that enables users to supply coin (ETH) / tokens to the contract and get the rewards based on the amount of token they supply and also allows users to borrow tokens from it.

It is deployed on the **Ethereum Sepolia Testnet.**

## Build with

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

- Next JS
- Tailwind CSS
- Hardhat
- Etherjs
- Solidity
- Openzeppelin
- ERC20
- Chainlink
- Ethereum
- Metamask

## To run the project on Sepolia Testnet

1. Metamask : Install wallet extention on your browser ( Chrome recommended ).

   Follow this article to install metamask : https://www.geeksforgeeks.org/how-to-install-and-use-metamask-on-google-chrome/

2. Add Sepolia to MetaMask

   2.1 To add the Sepolia testnet to MetaMask, click the network button at the top of your wallet and click “Add Network”.

   ...snip...   
   <img src="https://user-images.githubusercontent.com/61042463/226925417-a59f11d7-dc25-4167-b4c6-508793327abd.png" width="400" height="400">

   2.2 At the bottom of the page, click “Add a network manually”.

   <img src="https://user-images.githubusercontent.com/61042463/226925715-26272ad1-ce26-46c0-9140-c8f523d25cd8.png" width="700" height="350">

   2.3 Add network configuration details along with the following information:

   - **Network name** : Sepolia test network
   - **New RPC URL** : https://sepolia.infura.io/v3/
   - **Chain ID** : 11155111
   - **Currency symbol** : SepoliaETH
   - **Block explorer URL** : https://sepolia.etherscan.io

   ![image](https://user-images.githubusercontent.com/61042463/226937721-785bb706-b21d-4291-9dcc-357d1d97ed4d.png)

3. Clone this repo :

```shell
git clone https://github.com/shubhamprajapati241/lendhub.git
```

4. Go to the root directory and install all node packages

```shell
cd lendhub
npm install
```

5. Infura API key
   Follow this article to get Infura API key : https://medium.com/jelly-market/how-to-get-infura-api-key-e7d552dd396f

   Select the Sepolia and copy the url

   ![image](https://user-images.githubusercontent.com/61042463/226934039-519747cb-acbb-4403-893f-2c78c2d33bcd.png)

6. Get the Metamask wallet private key : https://support.metamask.io/hc/en-us/articles/360015289632

7. Create a new .env file into root directory

   Paste the Infura Sepolia API key and your metmask accounts private key into .env file

   ![env](https://user-images.githubusercontent.com/61042463/226642196-965329ef-6c17-43ab-9268-a243f9f04728.png)

8. Deploy on the Sepolia Testnet

```shell
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

9.  Add the sepolia deploy addresses into address.js file

![addresses-sepolia](https://user-images.githubusercontent.com/61042463/226643306-69d6d9cc-67d7-4b2a-9c8a-694a23501260.png)

10. Start the Nextjs Server

```shell
npm run dev
```

## To run the project on Hardhat localhost

1. Metamask : Install wallet extention on your browser ( Chrome recommended ).

   Follow this article to install metamask : https://www.geeksforgeeks.org/how-to-install-and-use-metamask-on-google-chrome/

2. Clone this repo :

```shell
git clone https://github.com/shubhamprajapati241/lendhub.git
```

3. Go to the root directory and install all node packages

```shell
cd lendhub
npm install
```

4. Compile, Test and Run the hardhat node

```shell
 npx hardhat compile
 npx hardhat test
 npx hardhat node
```

5. Deploy on the Hardhat localhost

```shell
npx hardhat run scripts/deploy.js --network localhost
```

6. Add the localhost deploy addresses into address.js file

![addresses](https://user-images.githubusercontent.com/61042463/226641194-637954ff-8230-4e41-82f0-3e42bb5dbdfe.png)

7. Start the Nextjs Server

```shell
npm run dev
```
