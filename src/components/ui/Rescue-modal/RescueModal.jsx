import React from "react";

import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";
import { toast } from "react-toastify";
import { sc, wallet } from "@cityofzion/neon-js";
import { WitnessScope } from "@rentfuse-labs/neo-wallet-adapter-base";
import { helpers } from "@cityofzion/props";

import { lifeTestnetContractAddress, nodeUrl } from "../../../utils/constants";
import { shortenAddress } from "../../../utils/shortenAddress";

import "./rescue-modal.css";

const RescueModal = (props) => {
  const {
    setShowRescueModal,
    nftId,
    role,
    setTxId,
    setShowLoadingModal,
    setStage,
  } = props;
  const { address, connected, invoke } = useWallet();

  function NewTab() {
    window.open("https://discord.gg/aEHWMdyeCB", "_blank");
  }

  const makeTransferable = async () => {
    if (!address || !connected) {
      toast.error(
        `🤦 You need to connect a wallet to make this LIFE transferable`,
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      return;
    }

    let param = {
      scriptHash: lifeTestnetContractAddress,
      operation: "makeTransferable",
      args: [
        {
          type: "String",
          value: sc.ContractParam.string(nftId).toJson().value,
        },
      ],
      signers: [
        {
          account: wallet.getScriptHashFromAddress(address),
          scopes: WitnessScope.CalledByEntry,
        },
      ],
    };

    try {
      let result = await invoke(param);
      if (result.data?.txId) {
        setTxId(shortenAddress(result.data?.txId));
        setShowRescueModal(false);
        setShowLoadingModal(true);
        setStage("blockchain");
        await helpers.sleep(20000);
        let new_result;
        new_result = await helpers.txDidComplete(
          nodeUrl,
          result.data?.txId,
          true
        );
        console.log(new_result);
        const sent = new_result[0];
        if (sent) {
          setStage("finished");
          toast.success(`😊 Transaction was successful`, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        } else {
          setStage("error");
          toast.error(`🤦 Transaction was not successful`, {
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
      }
    } catch (error) {
      console.log(error);
      toast.error(`🤦 ${error.description}`, {
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
  };
  return (
    <div className="modal__wrapper">
      <div className="single__modal">
        <span className="close__modal">
          <i
            className="ri-close-line"
            onClick={() => setShowRescueModal(false)}
          ></i>
        </span>
        <h6 className="text-center text-light">Rescue NFT of ID: {nftId}</h6>
        {role === "FAN" && (
          <>
            <p className="text-center text-light">
              To rescue this NFT, please contact AfricaN3 admins via discord
            </p>
            <button onClick={() => NewTab()} className="place__bid-btn">
              Contact
            </button>
          </>
        )}
        {role === "ADMIN" && (
          <>
            <p className="text-center text-light">
              To make this NFT transferable, please click on the button below
            </p>
            <button
              type="button"
              onClick={() => makeTransferable()}
              className="place__bid-btn"
            >
              Rescue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RescueModal;
