import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Header, MainCard, LendingPool, DisconnectedTab } from "../components";

// Applying Inter font
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      {/* Connected div */}

      <div>
        <div className="App bg-gradient-to-b from-[#212430] to-[#17171a] h-[17rem] text-white">
          <Header />
          <MainCard />
        </div>

        {/* <LendingPool /> */}

        <DisconnectedTab />
      </div>
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
