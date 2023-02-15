import React, { useState, useEffect, useMemo, useCallback } from "react";

import { useForm } from "react-hook-form";
import Neon from "@cityofzion/neon-js";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";
import { toast } from "react-toastify";
import { sc, wallet } from "@cityofzion/neon-js";
import { WitnessScope } from "@rentfuse-labs/neo-wallet-adapter-base";
import { helpers } from "@cityofzion/props";

import "./donate-modal.css";
import {
  tokens,
  gasContractAddress,
  lifeMainnetContractAddress,
  mainnetMagic,
  factor,
  nodeUrl,
} from "../../../utils/constants";
import {
  toInvocationArgument,
  convertPermissions,
} from "../../../utils/converter";

const adminSchema = yup
  .object({
    archetype: yup.number().required("Archetype is required"),
    wallet: yup.string().test(
      "is-wallet",
      (d) => `${d.path} is not a valid address`,
      (value) => wallet.isAddress(value)
    ),
  })
  .required();

const guestSchema = yup
  .object({
    amount: yup
      .number()
      .typeError("Amount is required")
      .positive("Amount must be positive")
      .default(10),
    token: yup.string().required(),
  })
  .required();

const DonateModal = ({
  setShowDonateModal,
  eraID,
  mintFee,
  role,
  toDonate,
  gasBalance,
  setToDonate,
  setTxId,
  setShowLoadingModal,
  setStage,
  isOfEra,
  state,
}) => {
  const { address, connected, invoke } = useWallet();
  const [schema, setSchema] = useState({});
  const [supportedTokens, setSupportedTokens] = useState(tokens);
  const lifeContract = useMemo(
    () =>
      new Neon.experimental.SmartContract(
        Neon.u.HexString.fromHex(lifeMainnetContractAddress),
        {
          networkMagic: mainnetMagic,
          rpcAddress: nodeUrl,
        }
      ),
    []
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

  const isTokenSupported = useCallback(
    async (token) => {
      const isTokenSupportedResult = await lifeContract.testInvoke(
        "isTokenSupported",
        [toInvocationArgument("Hash160", token)]
      );
      return isTokenSupportedResult.stack[0].value;
    },
    [lifeContract]
  );

  const tokenAccountBalance = async (token) => {
    const tokenContract = new Neon.experimental.SmartContract(
      Neon.u.HexString.fromHex(token),
      {
        networkMagic: mainnetMagic,
        rpcAddress: nodeUrl,
      }
    );
    const accountBalanceResult = await tokenContract.testInvoke("balanceOf", [
      toInvocationArgument("Hash160", address),
    ]);
    return accountBalanceResult.stack[0].value;
  };

  const getTokenSymbol = async (token) => {
    const tokenContract = new Neon.experimental.SmartContract(
      Neon.u.HexString.fromHex(token),
      {
        networkMagic: mainnetMagic,
        rpcAddress: nodeUrl,
      }
    );
    const tokenSymbolResult = await tokenContract.testInvoke("symbol");
    return convertPermissions(tokenSymbolResult.stack[0].value);
  };

  const getTokenDecimals = async (token) => {
    const tokenContract = new Neon.experimental.SmartContract(
      Neon.u.HexString.fromHex(token),
      {
        networkMagic: mainnetMagic,
        rpcAddress: nodeUrl,
      }
    );
    const tokenDecimalsResult = await tokenContract.testInvoke("decimals");
    return tokenDecimalsResult.stack[0].value;
  };

  const startDonate = () => {
    setToDonate(false);
  };

  useEffect(() => {
    if ((role === "admin") & !toDonate) {
      setSchema(adminSchema);
    } else {
      setSchema(guestSchema);
    }
  }, [role, toDonate]);

  useEffect(() => {
    const asyncFilter = async () =>
      tokens.reduce(
        async (list, token) =>
          (await isTokenSupported(token.value))
            ? [...(await list), token]
            : list,
        []
      );
    const getSupportedTokens = async () => {
      let result = await asyncFilter();
      setSupportedTokens(result);
    };

    getSupportedTokens();
  }, [isTokenSupported]);

  console.log(supportedTokens);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const offlineMint = async (data) => {
    console.log(data);
    if (!address || !connected) {
      toast.error(`🤦 You need to connect a wallet to create an Era`, {
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
      scriptHash: lifeMainnetContractAddress,
      operation: "offlineMint",
      args: [
        {
          type: "Integer",
          value: sc.ContractParam.integer(eraID).toJson().value,
        },
        {
          type: "Hash160",
          value: sc.ContractParam.hash160(data.wallet).toJson().value,
        },
        {
          type: "Integer",
          value: sc.ContractParam.integer(data.archetype).toJson().value,
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
        setTxId(result.data?.txId);
        setShowDonateModal(false);
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

  const mint = async () => {
    if (!address || !connected) {
      toast.error(`🤦 You need to connect a wallet to mint LIFE`, {
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
    if (parseInt(mintFee) > parseInt(gasBalance)) {
      toast.error(`🤦 You have insufficient GAS.`, {
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
    if (isOfEra) {
      toast.error(`🤦 You already have a LIFE of this era: ${eraID}.`, {
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
    let action_type = sc.ContractParam.string("ACTION_DONATE");
    let era_id = sc.ContractParam.integer(eraID);

    let data_array = [action_type, era_id];

    let param = {
      scriptHash: gasContractAddress,
      operation: "transfer",
      args: [
        {
          type: "Hash160",
          value: sc.ContractParam.hash160(address).toJson().value,
        },
        {
          type: "Hash160",
          value: sc.ContractParam.hash160(lifeMainnetContractAddress).toJson()
            .value,
        },
        {
          type: "Integer",
          value: sc.ContractParam.integer(mintFee).toJson().value,
        },
        {
          type: "Array",
          value: sc.ContractParam.array(...data_array).toJson().value,
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
        setTxId(result.data?.txId);
        setShowDonateModal(false);
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
  const donate = async (data) => {
    if (!address || !connected) {
      toast.error(`🤦 You need to connect a wallet to donate`, {
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
    if (!(await isTokenSupported(data.token))) {
      toast.error(`🤦 Token is not supported`, {
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
    let tokenDecimal = await getTokenDecimals(data.token);
    console.log(tokenDecimal);
    if (
      data.amount * Math.pow(10, tokenDecimal) >
      parseInt(await tokenAccountBalance(data.token))
    ) {
      toast.error(
        `🤦 You have insufficient ${await getTokenSymbol(data.token)}.`,
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
    if (
      (data.token === gasContractAddress) &
      (data.amount * Math.pow(10, tokenDecimal) === mintFee) &
      isOfEra
    ) {
      toast.error(
        `🤦 You already minted LIFE of this Era. Please send another amount of GAS`,
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
    let action_type = sc.ContractParam.string("ACTION_DONATE");
    let era_id = sc.ContractParam.integer(eraID);

    let data_array = [action_type, era_id];

    let param = {
      scriptHash: data.token,
      operation: "transfer",
      args: [
        {
          type: "Hash160",
          value: sc.ContractParam.hash160(address).toJson().value,
        },
        {
          type: "Hash160",
          value: sc.ContractParam.hash160(lifeMainnetContractAddress).toJson()
            .value,
        },
        {
          type: "Integer",
          value: sc.ContractParam.integer(
            data.amount * Math.pow(10, tokenDecimal)
          ).toJson().value,
        },
        {
          type: "Array",
          value: sc.ContractParam.array(...data_array).toJson().value,
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
        setTxId(result.data?.txId);
        setShowDonateModal(false);
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
            onClick={() => setShowDonateModal(false)}
          ></i>
        </span>
        {!toDonate && role === "guest" && (
          <>
            <h6 className="text-center text-light">Mint NFT to Era {eraID}</h6>
            <p className="text-center text-light">
              Mint LIFE of Era {eraID} by spending{` ${mintFee / factor} GAS`}
            </p>
            <button
              type="button"
              className="place__bid-btn"
              onClick={() => mint()}
            >
              Mint
            </button>
          </>
        )}
        {!toDonate && role === "fan" && (
          <h6 className="text-center text-light">
            You cannot mint NFT of this Era: {eraID}
          </h6>
        )}
        {!toDonate && role === "admin" && (
          <>
            <h6 className="text-center text-light">
              Mint NFT for fan / blood donor of Era: {eraID}
            </h6>
            <p className="text-center text-light">
              Mint LIFE to an address that attended or donated blood during this
              Era
            </p>
            <form onSubmit={handleSubmit(offlineMint)}>
              <div className="input__item mb-4">
                <input
                  type="text"
                  placeholder="Wallet Address (N...)"
                  {...register("wallet")}
                />
                <p className="errors">{errors.wallet?.message}</p>
              </div>
              <div className="input__item mb-3">
                <h6>Donor / Fan</h6>
                <select {...register("archetype")} className="input__item mb-3">
                  {state === 2 ? (
                    <option value={0}>Only Attended drive</option>
                  ) : null}
                  {state === 0 ? (
                    <option value={1}>Donated blood</option>
                  ) : null}
                </select>
                <p className="errors">{errors.archetype?.message}</p>
              </div>
              <button type="submit" className="place__bid-btn">
                Mint
              </button>
            </form>
          </>
        )}
        {toDonate && (
          <>
            <h6 className="text-center text-light">Donate to Era {eraID}</h6>
            <p className="text-center text-light">
              You can donate any amount of these supported tokens
            </p>
            <form onSubmit={handleSubmit(donate)}>
              <div className="input__item mb-4">
                <input
                  type="number"
                  placeholder="10.0"
                  step="any"
                  {...register("amount")}
                />
                <p className="errors">{errors.amount?.message}</p>
              </div>
              <div className="input__item mb-3">
                <h6>Select Token</h6>
                <select {...register("token")} className="input__item mb-3">
                  {supportedTokens.map((token) => (
                    <option key={token.value} value={token.value}>
                      {token.display}
                    </option>
                  ))}
                </select>
                <p className="errors">{errors.token?.message}</p>
              </div>
              <div
                className=" d-flex align-items-center justify-content-between"
                onClick={startDonate}
              >
                <p>To mint LIFE donate:</p>
                <span className="money">{` ${mintFee / factor}`} GAS</span>
              </div>
              <button type="submit" className="place__bid-btn">
                Donate
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
