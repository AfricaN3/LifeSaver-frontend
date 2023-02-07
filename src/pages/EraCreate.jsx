import React, { useState } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Container, Row, Col } from "reactstrap";
import { sc, wallet, u } from "@cityofzion/neon-js";
import { WitnessScope } from "@rentfuse-labs/neo-wallet-adapter-base";
import { helpers } from "@cityofzion/props";
import { toast } from "react-toastify";
import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";

import useReadNeo from "../hooks/useReadNeo";
import { shortenAddress } from "../utils/shortenAddress";
import {
  factor,
  gasContractAddress,
  nodeUrl,
  lifeTestnetContractAddress,
} from "../utils/constants";
import { dateToString } from "../utils/converter";
import CommonSection from "../components/ui/Common-section/CommonSection";
import LoadingModal from "../components/ui/Loading-modal/LoadingModal";

import "../styles/create-era.css";

const schema = yup
  .object({
    sponsor: yup
      .string()
      .required("Sponsoring organization's name is required"),
    noOfWinners: yup
      .number()
      .positive("Number of winners must be positive")
      .integer("Number of winners must be an integer")
      .required("Number of winners is required")
      .min(5, "The minimum number of raffle winners are 5"),
    eraDate: yup
      .date()
      .required()
      .min(new Date(), "Era date must be later than today"),
    mintFee: yup
      .number()
      .positive()
      .required()
      .min(1, "1 GAS is the least mint fee for an Era"),
  })
  .required();

const EraCreate = () => {
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [stage, setStage] = useState("started");
  const [txId, setTxId] = useState("");
  const { eraFee, gasBalance } = useReadNeo();
  const { address, connected, invoke } = useWallet();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const onSubmit = async (data) => {
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
    if (parseInt(eraFee) > parseInt(gasBalance)) {
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
    let formattedDate = dateToString(data.eraDate);
    let action_type = sc.ContractParam.string("ACTION_CREATE_ERA");
    let no_of_winners = sc.ContractParam.integer(data.noOfWinners);
    let organization = sc.ContractParam.byteArray(
      u.str2hexstring(data.sponsor)
    );
    let date = sc.ContractParam.byteArray(u.str2hexstring(formattedDate));
    let mint_fee = sc.ContractParam.integer(data.mintFee * factor);

    let data_array = [action_type, no_of_winners, organization, date, mint_fee];

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
          value: sc.ContractParam.hash160(lifeTestnetContractAddress).toJson()
            .value,
        },
        {
          type: "Integer",
          value: sc.ContractParam.integer(eraFee).toJson().value,
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
        setTxId(shortenAddress(result.data?.txId));
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
    <>
      <CommonSection title={`Create an Era with ${eraFee / factor} GAS`} />
      {showLoadingModal && (
        <LoadingModal
          setShowLoadingModal={setShowLoadingModal}
          stage={stage}
          txID={txId}
        />
      )}

      <section>
        <Container>
          <Row>
            <Col lg="9" md="8" sm="6">
              <div className="create__item">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form__input">
                    <label htmlFor="">Sponsor</label>
                    <input
                      type="text"
                      placeholder="Name of Era sponsor"
                      {...register("sponsor")}
                    />
                    <p className="errors">{errors.sponsor?.message}</p>
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Number of winners</label>
                    <input
                      type="number"
                      placeholder="Enter the number of raffle winners"
                      {...register("noOfWinners")}
                    />
                    <p className="errors">{errors.noOfWinners?.message}</p>
                  </div>

                  <div className=" d-flex align-items-center gap-4">
                    <div className="form__input w-50">
                      <label htmlFor="">Event Date</label>
                      <input type="date" {...register("eraDate")} />
                      <p className="errors">{errors.eraDate?.message}</p>
                    </div>

                    <div className="form__input w-50">
                      <label htmlFor="">Mint Fee</label>
                      <input
                        type="text"
                        placeholder="Enter Era Mint fee (GAS)"
                        {...register("mintFee")}
                      />
                      <p className="errors">{errors.mintFee?.message}</p>
                    </div>
                  </div>
                  <input type="submit" className="submit__btn" />
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default EraCreate;
