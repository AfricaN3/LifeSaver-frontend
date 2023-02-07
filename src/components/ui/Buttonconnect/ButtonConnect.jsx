import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@rentfuse-labs/neo-wallet-adapter-react-ui";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";

const ButtonConnect = () => {
  const { connected } = useWallet();
  if (!connected) {
    return (
      <WalletMultiButton
        size={"small"}
        className="btn d-flex gap-2 align-items-center"
      />
    );
  } else {
    return (
      <WalletDisconnectButton
        size={"small"}
        className="btn d-flex gap-2 align-items-center"
      />
    );
  }
};

export default ButtonConnect;
