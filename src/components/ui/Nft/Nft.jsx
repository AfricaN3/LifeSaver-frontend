import React from "react";
import { Container, Row, Col } from "reactstrap";

import "./nft.css";

import NftCard from "../Nft-card/NftCard";

const Nft = ({ lifeBalance }) => {
  return (
    <section id="nfts">
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            <h3 className="trending__title">My NFTs</h3>
            {lifeBalance.length < 1 && (
              <p className="">You have no LIFE yet!!!</p>
            )}
          </Col>

          {lifeBalance.slice(0, 8).map((item) => (
            <Col lg="3" md="4" sm="6" key={item.tokenId} className="mb-4">
              <NftCard item={item} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Nft;
