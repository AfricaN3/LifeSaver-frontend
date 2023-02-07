import React from "react";

import { Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import "./footer.css";
import logo from "../../assets/images/whitelogo.png";

import { Link } from "react-router-dom";

const MY__ACCOUNT = [
  {
    display: "My NFTs",
    url: "/home#nfts",
  },
  {
    display: "Create Era",
    url: "/create",
  },
  {
    display: "Rescue NFT",
    url: "/home#nfts",
  },
];

const RESOURCES = [
  {
    display: "Help Center",
    url: "https://discord.gg/YtWPRjw4Rr",
  },
  {
    display: "Partners",
    url: "/home#partners",
  },
  {
    display: "Community",
    url: "https://discord.gg/aEHWMdyeCB",
  },
];

const COMPANY = [
  {
    display: "About",
    url: "#",
  },
  {
    display: "Career",
    url: "https://discord.gg/aEHWMdyeCB",
  },
  {
    display: "Contact Us",
    url: "https://discord.gg/aEHWMdyeCB",
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col lg="3" md="6" sm="6" className="mb-4">
            <div className="footlogo">
              <img src={logo} alt="logo" />
              <p>Donate blood, Mint NFTs, Save Lives...</p>
            </div>
          </Col>

          <Col lg="2" md="3" sm="6" className="mb-4">
            <h5>My Account</h5>
            <ListGroup className="list__group">
              {MY__ACCOUNT.map((item, index) => (
                <ListGroupItem key={index} className="list__item">
                  <Link to={item.url}> {item.display} </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          <Col lg="2" md="3" sm="6" className="mb-4">
            <h5>Resources</h5>
            <ListGroup className="list__group">
              {RESOURCES.map((item, index) => (
                <ListGroupItem key={index} className="list__item">
                  <a href={item.url}> {item.display} </a>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          <Col lg="2" md="3" sm="6" className="mb-4">
            <h5>Company</h5>
            <ListGroup className="list__group">
              {COMPANY.map((item, index) => (
                <ListGroupItem key={index} className="list__item">
                  <a href={item.url}> {item.display} </a>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          <Col lg="3" md="6" sm="6" className="mb-4">
            <h5>Newsletter</h5>
            <input type="text" className="newsletter" placeholder="Email" />
            <div className="social__links d-flex gap-3 align-items-center ">
              <span>
                <Link to="#">
                  <i className="ri-twitter-line"></i>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-telegram-line"></i>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-discord-line"></i>
                </Link>
              </span>
            </div>
          </Col>

          <Col lg="12" className=" mt-4 text-center">
            <p className="copyright">
              {" "}
              Copyrights 2023, Developed by AfricaN3. All Rights Reserved.{" "}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
