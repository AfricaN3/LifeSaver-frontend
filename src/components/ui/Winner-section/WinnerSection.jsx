import React from "react";
import "./winner.css";
import { Container, Row, Col } from "reactstrap";
import { SELLER__DATA } from "../../../assets/data/data";

const WinnerSection = () => {
  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            <div className="winner__section-title">
              <h3>Era Raffle Winners</h3>
            </div>
          </Col>

          {SELLER__DATA.map((item) => (
            <Col lg="2" md="3" sm="4" xs="6" key={item.id} className="mb-4">
              <div className="single__winner-card d-flex align-items-center gap-3">
                <div className="winner__img">
                  <img src={item.sellerImg} alt="" className="w-100" />
                </div>

                <div className="winner__content">
                  <h6>{item.sellerName}</h6>
                  <h6>{item.currentBid} GAS</h6>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default WinnerSection;
