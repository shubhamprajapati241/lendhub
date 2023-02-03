import "../styles/globals.css";
import type { AppProps } from "next/app";
import Header from "../components/Header";
import MainCard from "../components/MainCard";

// Applying Inter font
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <div className="App bg-gradient-to-b from-[#212430] to-[#17171a] h-72 text-white">
        <Header />
        {/* Main Section */}
        <MainCard />
      </div>
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
