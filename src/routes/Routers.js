import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import EraCreate from "../pages/EraCreate";
import EraDetails from "../pages/EraDetails";
import NftDetails from "../pages/NftDetails";
import Eras from "../pages/Eras";

import useReadNeo from "../hooks/useReadNeo";

const Routers = () => {
  const { eras } = useReadNeo();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/era" element={<Eras eras={eras} />} />
      <Route path="/create" element={<EraCreate />} />
      <Route path="/nft/:id" element={<NftDetails />} />
      <Route path="/era/:id" element={<EraDetails eras={eras} />} />
    </Routes>
  );
};

export default Routers;
