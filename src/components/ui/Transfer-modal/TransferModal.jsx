import React from "react";

import { useForm } from "react-hook-form";
import Neon from "@cityofzion/neon-js";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";
import { toast } from "react-toastify";
import { sc, wallet } from "@cityofzion/neon-js";
import { WitnessScope } from "@rentfuse-labs/neo-wallet-adapter-base";
import { helpers } from "@cityofzion/props";
import { getTimestamp } from "../../../utils/timestamp";
import moment from "moment";

import {
  lifeTestnetContractAddress,
  testnetMagic,
  nodeUrl,
} from "../../../utils/constants";
import {
  toInvocationArgument,
  convertToreadable,
} from "../../../utils/converter";
import { shortenAddress } from "../../../utils/shortenAddress";

import "./transfer-modal.css";

const schema = yup
  .object({
    wallet: yup.string().test(
      "is-wallet",
      (d) => `${d.path} is not a valid address`,
      (value) => wallet.isAddress(value)
    ),
  })
  .required();

const TransferModal = (props) => {
  const {
    setShowTransferModal,
    nftId,
    setTxId,
    setShowLoadingModal,
    setStage,
    eraID,
    timestamp,
  } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const { address, connected, invoke } = useWallet();

  let time = timestamp / 1000;

  const lifeContract = new Neon.experimental.SmartContract(
    Neon.u.HexString.fromHex(lifeTestnetContractAddress),
    {
      networkMagic: testnetMagic,
      rpcAddress: nodeUrl,
    }
  );

  const accountIsOfEra = async (eraId, address) => {
    let num = eraId;
    let str = num.toString();
    const isOfEraResult = await lifeContract.testInvoke("isOfEra", [
      toInvocationArgument("Hash160", address),
      toInvocationArgument("Integer", str),
    ]);
    return isOfEraResult.stack[0].value;
  };

  const ownerOf = async (nftId) => {
    const ownerOf = await lifeContract.testInvoke("ownerOf", [
      toInvocationArgument("String", nftId),
    ]);
    return ownerOf.stack[0].value;
  };

  const transfer = async (data) => {
    if (!address || !connected) {
      toast.error(`🤦 You need to connect a wallet to transfer LIFE`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    const nftOwner = await ownerOf(nftId);
    if (address !== convertToreadable("address", nftOwner)) {
      toast.error(
        `🤦 Connected wallet is not authorized to transfer this LIFE`,
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
    if (getTimestamp() > timestamp) {
      toast.error(
        `🤦
      LIFE is a soulbound token, contact AfricaN3 for rescue`,
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
    if (await accountIsOfEra(eraID, data.wallet)) {
      toast.error(`🤦 Wallet already contains Life of Era: ${eraID}.`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    let param = {
      scriptHash: lifeTestnetContractAddress,
      operation: "transfer",
      args: [
        {
          type: "Hash160",
          value: sc.ContractParam.hash160(data.wallet).toJson().value,
        },
        {
          type: "String",
          value: sc.ContractParam.string(nftId).toJson().value,
        },
        {
          type: "Any",
          value: sc.ContractParam.any(null).toJson().value,
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
        setShowTransferModal(false);
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
          toast.success(`🤦 Transaction was successful`, {
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
    <div className="transfermodal__wrapper">
      <div className="single__modal">
        <span className="close__modal">
          <i
            className="ri-close-line"
            onClick={() => setShowTransferModal(false)}
          ></i>
        </span>
        <h6 className="text-center text-light">Transfer NFT of ID: {nftId}</h6>
        <p className="text-center text-light">
          You can transfer this rescued NFT to another wallet
        </p>
        <form onSubmit={handleSubmit(transfer)}>
          <div className="input__item mb-4">
            <input
              placeholder="Wallet Address"
              {...register("wallet", { required: true })}
            />
            <p className="errors">{errors.wallet?.message}</p>
          </div>
          <div className=" d-flex align-items-center justify-content-between">
            <p>Time left for transfer:</p>
            <span className="money">{moment.unix(time).fromNow()}</span>
          </div>
          <button type="submit" className="place__bid-btn">
            Transfer
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
