import React, { useState, useEffect, useMemo } from "react";
import { WalletProvider } from "@rentfuse-labs/neo-wallet-adapter-react";
import logo from "../assets/images/whitelogo.png";
import {
  getNeoLineWallet,
  getOneGateWallet,
} from "@rentfuse-labs/neo-wallet-adapter-wallets";
import { WalletModalProvider } from "@rentfuse-labs/neo-wallet-adapter-react-ui";

// Default styles that can be overridden by your app
require("@rentfuse-labs/neo-wallet-adapter-react-ui/styles.css");

const NWA = ({ children }) => {
  const getWallets = useMemo(() => {
    return [getNeoLineWallet(), getOneGateWallet()];
  }, []);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    setWallets(getWallets);
  }, [getWallets]);

  return (
    <>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider centered={false} logo={logo} featuredWallets={3}>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </>
  );
};

export default NWA;
