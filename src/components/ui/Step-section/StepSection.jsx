import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

import "./step-section.css";

const STEP__DATA = [
  {
    title: "Setup your wallet",
    desc: "Download, install and setup the OneGate app on your mobile phones or Neoline wallet on your computer. ",
    icon: "ri-wallet-line",
  },

  {
    title: "Attend blood drive",
    desc: "Be present at any LifeSaver NFTs supported blood drive event close to you to mint LIFE for free.",
    icon: "ri-calendar-event-line",
  },

  {
    title: "Mint LIFE",
    desc: "Support our blood drive events by minting LIFE with GAS. You also get an entry in our raffle draw. ",
    icon: "ri-coin-line",
  },

  {
    title: "Finance Us",
    desc: "Create an Era or give a donation to aid our goal of encouraging people to save lives by donating blood.  ",
    icon: "ri-money-dollar-box-line",
  },
];

const StepSection = () => {
  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-4">
            <h3 className="step__title">Save a life today</h3>
          </Col>

          {STEP__DATA.map((item, index) => (
            <Col lg="3" md="4" sm="6" key={index} className="mb-4">
              <div className="single__step__item">
                <span>
                  <i className={item.icon}></i>
                </span>
                <div className="step__item__content">
                  <h5>
                    <Link to="/wallet">{item.title}</Link>
                  </h5>
                  <p className="mb-0">{item.desc}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default StepSection;
