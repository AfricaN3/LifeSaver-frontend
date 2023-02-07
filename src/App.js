import "./app.css";

import Layout from "./components/Layout/Layout";
import NWA from "./context/NWA";

function App() {
  return (
    <NWA>
      <Layout />
    </NWA>
  );
}

export default App;
