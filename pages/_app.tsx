import "../styles/globals.css";
import type { AppProps } from "next/app";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="App bg-gradient-to-b from-[#212430] to-[#17171a] h-72">
      <Header />
      {/* Main Section */}

      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
