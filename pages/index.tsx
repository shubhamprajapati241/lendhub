import type { NextPage } from "next";
import Head from "next/head";
import { useContext, useEffect } from "react";
import lendContext from "../context/lendContext";
import {
  Header,
  MainCard,
  LendingPool,
  DisconnectedTab,
  ModalSupply,
} from "../components";

const Home: NextPage = () => {
  const { connectWallet, metamaskDetails, getUserAssets, getSupplyAssets } =
    useContext(lendContext);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    getUserAssets();
    getSupplyAssets();
  }, [metamaskDetails]);
  return (
    <div>
      <Head>
        <title>LendHub - DeFi Lending and Borrowing Protocol</title>
        <link rel="icon" href="/lendhub-favi.png" />
      </Head>

      <main className="w-full p-0 m-0">
        <div>
          <div>{}</div>
          <div className="App bg-gradient-to-b from-[#212430] to-[#17171a] h-[17rem] text-white">
            <Header />
            <MainCard />
          </div>

          {!metamaskDetails.currentAccount ? (
            <DisconnectedTab />
          ) : (
            <LendingPool />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
