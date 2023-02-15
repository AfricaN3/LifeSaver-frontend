import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Neon from "@cityofzion/neon-js";
import Identicon from "react-identicons";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";

import eraImage from "../../../assets/images/hero.png";
import { shortenAddress } from "../../../utils/shortenAddress";
import { toInvocationArgument } from "../../../utils/converter";
import {
  lifeMainnetContractAddress,
  mainnetMagic,
  nodeUrl,
  gasContractAddress,
  factor,
} from "../../../utils/constants";
import DonateModal from "../Donate-modal/DonateModal";
import LoadingModal from "../Loading-modal/LoadingModal";
import EraCardButton from "./EraCardButton";
import useReadNeo from "../../../hooks/useReadNeo";

import "./era-card.css";

const NftCard = ({ item }) => {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const { address, connected } = useWallet();
  const [isOfEra, setIsOfEra] = useState(false);
  const [role, setRole] = useState("guest");
  const [toDonate, setToDonate] = useState(false);
  const { userPermissions, gasBalance } = useReadNeo();
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [stage, setStage] = useState("started");
  const [txId, setTxId] = useState("");
  const [reward, setReward] = useState(0);

  const startDonate = () => {
    setToDonate(true);
    setShowDonateModal(true);
  };

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

  useEffect(() => {
    const getReward = async () => {
      let num = item[5];
      let str = num.toString();
      const gasRewardResult = await lifeContract.testInvoke("getEraReward", [
        toInvocationArgument("Hash160", gasContractAddress),
        toInvocationArgument("Integer", str),
      ]);
      setReward(gasRewardResult.stack[0].value);
    };
    getReward();
  }, [item, lifeContract]);

  useEffect(() => {
    if (connected) {
      const sendTransaction = async () => {
        let num = item[5];
        let str = num.toString();
        const isOfEraResult = await lifeContract.testInvoke("isOfEra", [
          toInvocationArgument("Hash160", address),
          toInvocationArgument("Integer", str),
        ]);
        setIsOfEra(isOfEraResult.stack[0].value);
      };
      sendTransaction();
    } else {
      setIsOfEra(false);
    }
  }, [address, connected, item, lifeContract]);

  useEffect(() => {
    if (userPermissions["offline_mint"] || address === item[0]) {
      setRole("admin");
    } else if (isOfEra) {
      setRole("fan");
    } else {
      setRole("guest");
    }
  }, [address, isOfEra, item, userPermissions]);

  return (
    <div className="single__nft__card">
      <div className="nft__img">
        <img src={eraImage} alt="" className="w-100" />
      </div>

      <div className="nft__content">
        <h5 className="nft__title">
          <Link to={`/era/${item[5]}`}>{item[1]}</Link>
        </h5>

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__img">
            <Identicon string={item[0]} size={50} />
          </div>

          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Created By</h6>
              <p>{shortenAddress(item[0])}</p>
            </div>

            <div>
              <h6>Raffle bag</h6>
              <p>{reward / factor} GAS</p>
            </div>
          </div>
        </div>

        <div className=" mt-3 d-flex align-items-center justify-content-between">
          <EraCardButton
            setShowDonateModal={setShowDonateModal}
            role={role}
            startDonate={startDonate}
            btnStyle={`bid__btn d-flex align-items-center gap-1`}
          />
          {showLoadingModal && (
            <LoadingModal
              setShowLoadingModal={setShowLoadingModal}
              stage={stage}
              txID={txId}
            />
          )}

          {showDonateModal && (
            <DonateModal
              setShowDonateModal={setShowDonateModal}
              eraID={item[5]}
              mintFee={item[4]}
              role={role}
              toDonate={toDonate}
              setToDonate={setToDonate}
              gasBalance={gasBalance}
              setTxId={setTxId}
              setShowLoadingModal={setShowLoadingModal}
              setStage={setStage}
              isOfEra={isOfEra}
              state={item[7]}
            />
          )}

          {role !== "fan" && (
            <span className="history__link" onClick={() => startDonate()}>
              <Link to="#">Donate</Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NftCard;
