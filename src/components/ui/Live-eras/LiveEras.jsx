import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

import EraCard from "../Era-card/EraCard";

import "./live-eras.css";

const LiveAuction = ({ eras }) => {
  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            <div className="live__auction__top d-flex align-items-center justify-content-between ">
              <h3>Live Eras</h3>
              <span>
                <Link to="/era">Explore more</Link>
              </span>
            </div>
          </Col>

          {eras
            .filter((item) => item[7] === 0)
            .slice(0, 4)
            .map((item) => (
              <Col lg="3" md="4" sm="6" className="mb-4" key={item[5]}>
                <EraCard item={item} />
              </Col>
            ))}
        </Row>
      </Container>
    </section>
  );
};

export default LiveAuction;
