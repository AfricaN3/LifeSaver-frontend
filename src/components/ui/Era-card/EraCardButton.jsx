import React from "react";

const EraCardButton = (props) => {
  let { setShowDonateModal, role, startDonate, btnStyle } = props;

  switch (role) {
    case "admin":
      return (
        <button className={btnStyle} onClick={() => setShowDonateModal(true)}>
          <i className="ri-shopping-bag-line"></i> Mint
        </button>
      );
    case "guest":
      return (
        <button className={btnStyle} onClick={() => setShowDonateModal(true)}>
          <i className="ri-shopping-bag-line"></i> Mint
        </button>
      );
    case "fan":
      return (
        <button className={btnStyle} onClick={() => startDonate()}>
          <i className="ri-empathize-line"></i> Donate
        </button>
      );
    default:
      return (
        <button className={btnStyle} onClick={() => setShowDonateModal(true)}>
          <i className="ri-shopping-bag-line"></i> Mint
        </button>
      );
  }
};

export default EraCardButton;
