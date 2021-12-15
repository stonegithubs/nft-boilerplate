import { Web3ReactProvider, Web3Provider } from "@web3-react/core";
import Layout from "../components/Layout";
import { ethers } from "ethers";

import "./global.css";

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

function App({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Web3ReactProvider>
  );
}

export default App;
