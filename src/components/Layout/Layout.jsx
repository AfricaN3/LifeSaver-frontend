import React from "react";

import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import Routers from "../../routes/Routers";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Layout = () => {
  return (
    <div>
      <ToastContainer />
      <Header />
      <div>
        <Routers />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
