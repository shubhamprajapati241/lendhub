import type { NextPage } from "next";
import Head from "next/head";
import { useContext, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import lendContext from "../context/lendContext";
import { Header, MainCard, LendingPool, DisconnectedTab } from "../components";

const Home: NextPage = () => {
  const {
    connectWallet,
    metamaskDetails,
    getUserAssets,
    getYourSupplies,
    getAssetsToBorrow,
    updateInterests,
    getYourBorrows,
  } = useContext(lendContext);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    // setInterval(() => connectWallet(), 5000);
    // updateInterests();

    getUserAssets();
    getYourSupplies();
    getAssetsToBorrow();
    getYourBorrows();
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
          <div className="App bg-gradient-to-b from-[#212430] to-[#17171a] h-[12rem] text-white">
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

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Home;
