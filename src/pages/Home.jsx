import React, { useEffect } from "react";

import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";
import { toast } from "react-toastify";

import Nft from "../components/ui/Nft/Nft";
import StepSection from "../components/ui/Step-section/StepSection";
import HeroSection from "../components/ui/HeroSection";
import LiveEras from "../components/ui/Live-eras/LiveEras";
import { Partners } from "../components/ui/Partners/Partners";

import useReadNeo from "../hooks/useReadNeo";

const Home = () => {
  const { eras, lifeBalance } = useReadNeo();
  const { connected } = useWallet();

  useEffect(() => {
    if (!connected) {
      toast.info(`👛 Connect wallet to view your LIFE NFTs`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }, [connected]);

  return (
    <>
      <HeroSection />
      <StepSection />
      {eras.length > 0 ? <LiveEras eras={eras} /> : null}
      <Partners />
      {connected ? <Nft lifeBalance={lifeBalance} /> : null}
    </>
  );
};

export default Home;
