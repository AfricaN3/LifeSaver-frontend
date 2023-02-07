import React, { useState, useEffect } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";
import { useParams } from "react-router-dom";
import Identicon from "react-identicons";
import { Container, Row, Col } from "reactstrap";
import Neon from "@cityofzion/neon-js";
import { toast } from "react-toastify";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";
import {
  lifeTestnetContractAddress,
  testnetMagic,
  nodeUrl,
} from "../utils/constants";
import { getTimestamp } from "../utils/timestamp";
import {
  toInvocationArgument,
  convertPermissions,
  convertToreadable,
} from "../utils/converter";
import { shortenAddress } from "../utils/shortenAddress";

import RescueModal from "../components/ui/Rescue-modal/RescueModal";
import TransferModal from "../components/ui/Transfer-modal/TransferModal";
import LoadingModal from "../components/ui/Loading-modal/LoadingModal";
import useReadNeo from "../hooks/useReadNeo";
import angelImg from "../assets/images/angel.png";
import donorImg from "../assets/images/donor.png";
import fanImg from "../assets/images/fan.png";

import "../styles/nft-details.css";

import { Link } from "react-router-dom";

const NftDetails = () => {
  const { id } = useParams();
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [stage, setStage] = useState("started");
  const [txId, setTxId] = useState("");
  const [nftData, setNftData] = useState({});
  const [state, setState] = useState("LOADING");
  const { address } = useWallet();
  const { userPermissions } = useReadNeo();
  const [role, setRole] = useState("GUEST");

  useEffect(() => {
    const lifeContract = new Neon.experimental.SmartContract(
      Neon.u.HexString.fromHex(lifeTestnetContractAddress),
      {
        networkMagic: testnetMagic,
        rpcAddress: nodeUrl,
      }
    );
    let getNftData = async () => {
      const lifeResult = await lifeContract.testInvoke("getLifeJson", [
        toInvocationArgument("String", id),
      ]);

      if (lifeResult.state === "FAULT") {
        toast.error(`🤦 ${lifeResult.exception}`, {
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
      let rawResult = lifeResult.stack[0].value;
      const dictionary = rawResult.reduce((dictionary, attribute) => {
        dictionary[convertPermissions(attribute.key.value)] =
          attribute.value.value;
        return dictionary;
      }, {});
      setNftData(dictionary);
      setState(lifeResult.state);
    };
    getNftData();
  }, [id]);

  useEffect(() => {
    if (userPermissions["initiate_transfer"]) {
      setRole("ADMIN");
    } else if (
      nftData &&
      address === convertToreadable("address", nftData?.owner)
    ) {
      setRole("FAN");
    } else {
      setRole("GUEST");
    }
  }, [address, nftData, userPermissions]);

  console.log(getTimestamp());
  console.log(nftData.timestamp);

  return (
    <>
      <CommonSection
        title={
          state === "HALT"
            ? `${convertPermissions(nftData?.name).toUpperCase()}`
            : `Loading...`
        }
      />
      {state === "HALT" && (
        <section>
          <Container>
            <Row>
              <Col lg="6" md="6" sm="6">
                {/* <img
                src={nftData.inage}
                alt={nftData.archetype}
                className="w-100 single__nft-img"
              /> */}
                {convertPermissions(nftData.archetype) === "angel" && (
                  <img
                    src={angelImg}
                    alt=""
                    className="w-100 single__nft-img"
                  />
                )}
                {convertPermissions(nftData.archetype) === "donor" && (
                  <img
                    src={donorImg}
                    alt=""
                    className="w-100 single__nft-img"
                  />
                )}
                {convertPermissions(nftData.archetype) === "fan" && (
                  <img src={fanImg} alt="" className="w-100 single__nft-img" />
                )}
              </Col>

              <Col lg="6" md="6" sm="6">
                <div className="single__nft__content">
                  <h2>{convertPermissions(nftData.name).toUpperCase()}</h2>

                  <div className=" d-flex align-items-center justify-content-between mt-4 mb-4">
                    <div className=" d-flex align-items-center gap-4 single__nft-seen">
                      <span>
                        <i className="ri-medal-line"></i>{" "}
                        {convertPermissions(nftData.archetype).toUpperCase()}
                      </span>
                      <span>
                        <i className="ri-fingerprint-line"></i>{" "}
                        {convertPermissions(nftData.tokenId)}
                      </span>
                    </div>

                    <div className=" d-flex align-items-center gap-2 single__nft-more">
                      <span>
                        <i className="ri-send-plane-line"></i>
                      </span>
                      <span>
                        <i className="ri-more-2-line"></i>
                      </span>
                    </div>
                  </div>

                  <div className="nft__creator d-flex gap-3 align-items-center">
                    <div className="creator__img">
                      <Identicon
                        className="w-100"
                        string={convertPermissions(nftData.owner)}
                        size={50}
                      />
                    </div>

                    <div className="creator__detail">
                      <p>Owner</p>
                      <h6>
                        {shortenAddress(
                          convertToreadable("address", nftData.owner)
                        )}
                      </h6>
                    </div>
                  </div>

                  <p className="my-4">
                    {convertPermissions(nftData.description)}
                  </p>
                  {showTransferModal && (
                    <TransferModal
                      setShowTransferModal={setShowTransferModal}
                      nftId={id}
                      setTxId={setTxId}
                      setShowLoadingModal={setShowLoadingModal}
                      setStage={setStage}
                      eraID={nftData.eraId}
                      timestamp={nftData.timestamp}
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
                      nftId={id}
                      role={role}
                      setTxId={setTxId}
                      setShowLoadingModal={setShowLoadingModal}
                      setStage={setStage}
                    />
                  )}
                  {(role !== "GUEST") &
                    (getTimestamp() > nftData.timestamp) && (
                    <button
                      className="singleNft-btn d-flex align-items-center gap-2 w-100 rescue-btn"
                      onClick={() => setShowRescueModal(true)}
                    >
                      <i className="ri-user-settings-line"></i>
                      <Link to="#">Rescue</Link>
                    </button>
                  )}
                  {(address === convertToreadable("address", nftData.owner)) &
                    (getTimestamp() < nftData.timestamp) && (
                    <button
                      className="singleNft-btn d-flex align-items-center gap-2 w-100 mt-2"
                      onClick={() => setShowTransferModal(true)}
                    >
                      <i className="ri-file-transfer-line"></i>
                      <Link to="#">Transfer</Link>
                    </button>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </>
  );
};

export default NftDetails;
