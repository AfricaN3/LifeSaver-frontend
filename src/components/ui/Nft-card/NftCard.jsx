import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Identicon from "react-identicons";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";

import "./nft-card.css";
import angelImg from "../../../assets/images/angel.png";
import donorImg from "../../../assets/images/donor.png";
import fanImg from "../../../assets/images/fan.png";

import TransferModal from "../Transfer-modal/TransferModal";
import RescueModal from "../Rescue-modal/RescueModal";
import LoadingModal from "../Loading-modal/LoadingModal";
import useReadNeo from "../../../hooks/useReadNeo";
import {
  convertPermissions,
  convertToreadable,
} from "../../../utils/converter";
import { shortenAddress } from "../../../utils/shortenAddress";
import { getTimestamp } from "../../../utils/timestamp";

const NftCard = (props) => {
  const { name, tokenId, eraId, owner, archetype, timestamp } = props.item;

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [txId, setTxId] = useState("");
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [stage, setStage] = useState("started");
  const [role, setRole] = useState("GUEST");
  const { userPermissions } = useReadNeo();
  const { address } = useWallet();

  useEffect(() => {
    if (userPermissions["initiate_transfer"]) {
      setRole("ADMIN");
    } else if (address === convertToreadable("address", owner)) {
      setRole("FAN");
    } else {
      setRole("GUEST");
    }
  }, [address, owner, userPermissions]);

  return (
    <div className="single__nft__card">
      <div className="nft__img">
        {/* <img src={convertPermissions(image)} alt="" className="w-100" /> */}
        {convertPermissions(archetype) === "angel" && (
          <img src={angelImg} alt="" className="w-100" />
        )}
        {convertPermissions(archetype) === "donor" && (
          <img src={donorImg} alt="" className="w-100" />
        )}
        {convertPermissions(archetype) === "fan" && (
          <img src={fanImg} alt="" className="w-100" />
        )}
      </div>

      <div className="nft__content">
        <h5 className="nft__title">
          <Link to={`/nft/${convertPermissions(tokenId)}`}>
            {convertPermissions(name).toUpperCase()}
          </Link>
        </h5>

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__img">
            <Identicon
              className="w-100"
              string={convertPermissions(owner)}
              size={50}
            />
          </div>

          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Owner</h6>
              <p>{shortenAddress(convertToreadable("address", owner))}</p>
            </div>

            <div>
              <h6>Era</h6>
              <p>{eraId} </p>
            </div>
          </div>
        </div>

        <div className=" mt-3 d-flex align-items-center justify-content-between">
          {getTimestamp() >= timestamp && (
            <button
              className="bid__btn d-flex align-items-center gap-1"
              onClick={() => setShowRescueModal(true)}
            >
              <i className="ri-file-transfer-line"></i> Rescue
            </button>
          )}
          {getTimestamp() < timestamp && (
            <button
              className="bid__btn d-flex align-items-center gap-1"
              onClick={() => setShowTransferModal(true)}
            >
              <i className="ri-file-transfer-line"></i> Transfer
            </button>
          )}

          {showTransferModal && (
            <TransferModal
              setShowTransferModal={setShowTransferModal}
              nftId={convertPermissions(tokenId)}
              setTxId={setTxId}
              setShowLoadingModal={setShowLoadingModal}
              setStage={setStage}
              eraID={eraId}
              timestamp={timestamp}
            />
          )}
          {showLoadingModal && (
            <LoadingModal
              setShowLoadingModal={setShowLoadingModal}
              stage={stage}
              txID={txId}
            />
          )}
          {showRescueModal && (
            <RescueModal
              setShowRescueModal={setShowRescueModal}
              nftId={convertPermissions(tokenId)}
              role={role}
              setTxId={setTxId}
              setShowLoadingModal={setShowLoadingModal}
              setStage={setStage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NftCard;
