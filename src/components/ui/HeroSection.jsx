import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import "./hero-section.css";

import heroImg from "../../assets/images/bag.png";

const HeroSection = () => {
  return (
    <section className="hero__section">
      <Container>
        <Row>
          <Col lg="6" md="6">
            <div className="hero__content">
              <h2>
                Donate, Save a Life and Mint
                <span> LifeSaver</span> NFTs
              </h2>
              <p>
                The LiveSaver NFTs (LIFE) are soulbound tokens given to blood
                donors and blood drive event sponsors. The NFTs are meant to
                incentivize blood donation as they also serve as Raffle tickets.
              </p>

              <div className="hero__btns d-flex align-items-center gap-4">
                <button className=" explore__btn d-flex align-items-center gap-2">
                  <i className="ri-empathize-line"></i>{" "}
                  <Link to="/era">Donate</Link>
                </button>
                <button className=" create__btn d-flex align-items-center gap-2">
                  <i className="ri-file-add-line"></i>
                  <Link to="/create">Create</Link>
                </button>
              </div>
            </div>
          </Col>

          <Col lg="6" md="6">
            <div className="hero__img">
              <img src={heroImg} alt="" className="w-100" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
