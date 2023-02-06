import "../styles/globals.css";
import type { AppProps } from "next/app";

// Applying Inter font
import { Inter } from "@next/font/google";
import LendState from "../context/LendState";

const inter = Inter({ subsets: ["latin"] });
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <LendState>
        <Component {...pageProps} />
      </LendState>
    </main>
  );
}

export default MyApp;
