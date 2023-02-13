import React, { useState, useEffect, useCallback } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import Identicon from "react-identicons";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";
import Neon, { sc, wallet } from "@cityofzion/neon-js";
import { toast } from "react-toastify";
import { WitnessScope } from "@rentfuse-labs/neo-wallet-adapter-base";
import { helpers } from "@cityofzion/props";

import LiveEras from "../components/ui/Live-eras/LiveEras";
import { shortenAddress } from "../utils/shortenAddress";
import DonateModal from "../components/ui/Donate-modal/DonateModal";
import LoadingModal from "../components/ui/Loading-modal/LoadingModal";
import EraCardButton from "../components/ui/Era-card/EraCardButton";
import {
  lifeTestnetContractAddress,
  testnetMagic,
  nodeUrl,
} from "../utils/constants";
import {
  toInvocationArgument,
  convertAddressFromEvent,
} from "../utils/converter";
import { convertEra } from "../utils/convertEra";
import useReadNeo from "../hooks/useReadNeo";
// import WinnerSection from "../components/ui/Winner-section/WinnerSection";
import eraImg from "../assets/images/hero.png";

import "../styles/era-details.css";

import { factor } from "../utils/constants";

const EraDetails = ({ eras }) => {
  const { id } = useParams();
  const [singleEra, setSingleEra] = useState([]);
  const [role, setRole] = useState("guest");
  const [toDonate, setToDonate] = useState(false);
  const { userPermissions, gasBalance } = useReadNeo();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [txId, setTxId] = useState("");
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [stage, setStage] = useState("started");
  const [isOfEra, setIsOfEra] = useState(false);
  const { address, connected, invoke } = useWallet();
  const [getEraState, setGetEraState] = useState("loading");

  const startDonate = () => {
    setToDonate(true);
    setShowDonateModal(true);
  };

  const getErasTransaction = useCallback(() => {
    const getEra = async () => {
      const contract = new Neon.experimental.SmartContract(
        Neon.u.HexString.fromHex(lifeTestnetContractAddress),
        {
          networkMagic: testnetMagic,
          rpcAddress: nodeUrl,
        }
      );
      let eraJsonResult = await contract.testInvoke("getEra", [
        toInvocationArgument("Integer", id),
      ]);
      console.log(eraJsonResult);
      if (eraJsonResult.state === "HALT") {
        let convertedEra = convertEra(eraJsonResult.stack[0].value);
        setSingleEra(convertedEra);
        setGetEraState("found");
      } else {
        toast.error(`🤦 ${eraJsonResult.exception}`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setGetEraState("error");
      }
    };
    getEra();
  }, [id]);

  useEffect(() => {
    getErasTransaction();
  }, [getErasTransaction]);

  useEffect(() => {
    const lifeContract = new Neon.experimental.SmartContract(
      Neon.u.HexString.fromHex(lifeTestnetContractAddress),
      {
        networkMagic: testnetMagic,
        rpcAddress: nodeUrl,
      }
    );
    if (connected) {
      const sendTransaction = async (eraList) => {
        let num = eraList[5];
        const isOfEraResult = await lifeContract.testInvoke("isOfEra", [
          toInvocationArgument("Hash160", address),
          toInvocationArgument("Integer", num),
        ]);
        setIsOfEra(isOfEraResult.stack[0].value);
      };
      if (singleEra.length > 0) {
        sendTransaction(singleEra);
      }
    } else {
      setIsOfEra(false);
    }
  }, [address, connected, singleEra]);

  useEffect(() => {
    if (singleEra) {
      if (userPermissions["offline_mint"] || address === singleEra[0]) {
        setRole("admin");
      } else if (isOfEra) {
        setRole("fan");
      } else {
        setRole("guest");
      }
    }
  }, [address, isOfEra, singleEra, userPermissions]);

  const endEra = async () => {
    if (!address || !connected) {
      toast.error(`🤦 You need to connect a wallet to end this era`, {
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
    if (singleEra[7] !== 0) {
      toast.error(`🤦 'Era is already ended`, {
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
    if (!userPermissions["manage_era"]) {
      toast.error(`🤦 User Permission Denied`, {
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
    if (singleEra[3] > singleEra[6]) {
      toast.error(`🤦 Not enough era NFT owners to end era`, {
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
      operation: "endEra",
      args: [
        {
          type: "Integer",
          value: sc.ContractParam.integer(id).toJson().value,
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

  const completeEra = async () => {
    if (!address || !connected) {
      toast.error(`🤦 You need to connect a wallet to end this era`, {
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
    if (singleEra[7] !== 2) {
      toast.error(`🤦 'Inappropriate era status`, {
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
    if (!userPermissions["manage_era"]) {
      toast.error(`🤦 User Permission Denied`, {
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
      operation: "completeEra",
      args: [
        {
          type: "Integer",
          value: sc.ContractParam.integer(id).toJson().value,
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

  const payWinner = async () => {
    if (!address || !connected) {
      toast.error(`🤦 You need to connect a wallet to pay winners`, {
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
    if (singleEra[7] !== 1) {
      toast.error(`🤦 Inappropriate Era status`, {
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
    if (!userPermissions["manage_era"]) {
      toast.error(`🤦 User Permission Denied`, {
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
      operation: "payWinner",
      args: [
        {
          type: "Integer",
          value: sc.ContractParam.integer(id).toJson().value,
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
        setShowLoadingModal(true);
        setStage("blockchain");
        await helpers.sleep(20000);
        let events = await helpers.getEvents(nodeUrl, result.data?.txId);
        let new_result;
        new_result = await helpers.txDidComplete(
          nodeUrl,
          result.data?.txId,
          true
        );
        console.log(new_result);
        console.log(events);
        const sent = new_result[0];
        if (sent) {
          setStage("finished");
          const winner = convertAddressFromEvent(events[0].value[1]);
          const reward = JSON.stringify(events[0].value[2]);
          toast.success(
            `🦄 New Winner!!! ${winner} has been sent ${reward / factor} GAS!`,
            {
              position: "bottom-center",
              autoClose: 15000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
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
    <>
      <CommonSection
        title={
          getEraState === "loading"
            ? "Loading..."
            : getEraState === "found"
            ? singleEra[1]
            : "Era not Found"
        }
      />
      {singleEra.length > 0 ? (
        <section>
          <Container>
            <Row>
              <Col lg="6" md="6" sm="6">
                <img src={eraImg} alt="" className="w-100 single__nft-img" />
              </Col>

              <Col lg="6" md="6" sm="6">
                <div className="single__nft__content">
                  <h2>{singleEra[1]}</h2>

                  <div className=" d-flex align-items-center justify-content-between mt-4 mb-4">
                    <div className=" d-flex align-items-center gap-4 single__nft-seen">
                      <span>
                        <i className="ri-user-line"></i> {singleEra[6]}
                      </span>
                      <span>
                        <i className="ri-shopping-cart-line"></i>{" "}
                        {singleEra[4] / factor} GAS
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
                        string={singleEra[0]}
                        size={50}
                      />
                    </div>

                    <div className="creator__detail">
                      <p>Created By</p>
                      <h6>
                        {singleEra
                          ? shortenAddress(singleEra[0])
                          : "Loading..."}
                      </h6>
                    </div>
                  </div>

                  <p className="my-4">{`This blood drive event is sponsored by ${singleEra[1]} on ${singleEra[2]}. There will be ${singleEra[3]} raffle winners.`}</p>

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
                      eraID={singleEra[5]}
                      mintFee={singleEra[4]}
                      role={role}
                      toDonate={toDonate}
                      setToDonate={setToDonate}
                      gasBalance={gasBalance}
                      setTxId={setTxId}
                      setShowLoadingModal={setShowLoadingModal}
                      setStage={setStage}
                      isOfEra={isOfEra}
                      state={singleEra[7]}
                    />
                  )}
                  {userPermissions["manage_era"] || singleEra[7] === 0 ? (
                    <EraCardButton
                      setShowDonateModal={setShowDonateModal}
                      role={role}
                      startDonate={startDonate}
                      btnStyle={`singleNft-btn d-flex align-items-center gap-2 w-100`}
                    />
                  ) : null}
                  {userPermissions["manage_era"] &&
                  singleEra[3] <= singleEra[6] &&
                  singleEra[7] === 0 ? (
                    <button
                      className={`singleNft-btn d-flex align-items-center gap-2 w-100 mt-2`}
                      onClick={() => endEra()}
                    >
                      <i className="ri-shopping-bag-line"></i> End Era
                    </button>
                  ) : null}
                  {userPermissions["manage_era"] && singleEra[7] === 1 ? (
                    <button
                      className={`singleNft-btn d-flex align-items-center gap-2 w-100 mt-2`}
                      onClick={() => payWinner()}
                    >
                      <i className="ri-shopping-bag-line"></i> Pay Winner
                    </button>
                  ) : null}
                  {userPermissions["manage_era"] && singleEra[7] === 2 ? (
                    <button
                      className={`singleNft-btn d-flex align-items-center gap-2 w-100 mt-2`}
                      onClick={() => completeEra()}
                    >
                      <i className="ri-shopping-bag-line"></i> Complete Era
                    </button>
                  ) : null}
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      ) : null}
      {/* <WinnerSection /> */}
      <LiveEras eras={eras} />
    </>
  );
};

export default EraDetails;
