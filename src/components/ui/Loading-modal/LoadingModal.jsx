import React from "react";

import "./loading-modal.css";

import { CirclesWithBar } from "react-loader-spinner";

const LoadingModal = ({ setShowLoadingModal, stage, txID }) => {
  return (
    <div className="modal__wrapper">
      <div className="single__modal">
        {stage !== "blockchain" && (
          <span className="close__modal">
            <i
              className="ri-close-line"
              onClick={() => setShowLoadingModal(false)}
            ></i>
          </span>
        )}
        {stage === "blockchain" && (
          <>
            <h6 className="text-center text-light">Transaction loading...</h6>
            <p className="text-center text-light">
              <a
                className="loading"
                target="_blank"
                rel="noreferrer"
                href={`https://dora.coz.io/transaction/neo3/testnet/${txID}`}
              >{`Confirming transaction: ${txID}`}</a>
            </p>
          </>
        )}
        {stage === "finished" && (
          <>
            <h6 className="text-center text-light">
              Transaction successful...
            </h6>
            <p className="text-center text-light">
              <a
                className="success"
                target="_blank"
                rel="noreferrer"
                href={`https://dora.coz.io/transaction/neo3/testnet/${txID}`}
              >{`Transaction was successful: ${txID}`}</a>
            </p>
          </>
        )}
        {stage === "error" && (
          <>
            <h6 className="text-center text-light">
              Transaction unsuccessful...
            </h6>
            <p className="text-center text-light">
              <a
                className="failure"
                target="_blank"
                rel="noreferrer"
                href={`https://dora.coz.io/transaction/neo3/testnet/${txID}`}
              >{`Transaction was not successful: ${txID}`}</a>
            </p>
          </>
        )}
        <CirclesWithBar
          height="100"
          width="100"
          color="#2bbb7f"
          wrapperStyle={{}}
          wrapperClass="loader"
          visible={stage === "blockchain"}
          outerCircleColor=""
          innerCircleColor=""
          barColor=""
          ariaLabel="circles-with-bar-loading"
        />
      </div>
    </div>
  );
};

export default LoadingModal;
