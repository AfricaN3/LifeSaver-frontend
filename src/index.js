import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import NWA from "./context/NWA";
import "bootstrap/dist/css/bootstrap.css";
import "remixicon/fonts/remixicon.css";

ReactDOM.render(
  <React.StrictMode>
    <NWA>
      <Router>
        <App />
      </Router>
    </NWA>
  </React.StrictMode>,
  document.getElementById("root")
);
