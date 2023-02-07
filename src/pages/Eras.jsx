import React, { useState, useEffect } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";

import EraCard from "../components/ui/Era-card/EraCard";

import { Container, Row, Col } from "reactstrap";

import "../styles/eras.css";

const Eras = ({ eras }) => {
  const [displayData, setDisplayData] = useState([]);
  useEffect(() => {
    setDisplayData(eras);
  }, [eras]);

  // ====== SORTING DATA BY HIGH, MID, LOW RATE =========
  const handleSort = (e) => {
    const filterValue = e.target.value;

    if (filterValue === "none") {
      setDisplayData(eras);
    }

    if (filterValue === "active") {
      const filterData = eras?.filter((item) => item[7] === 0);

      setDisplayData(filterData);
    }

    if (filterValue === "ended") {
      const filterData = eras?.filter((item) => item[7] === 1);

      setDisplayData(filterData);
    }

    if (filterValue === "paid") {
      const filterData = eras?.filter((item) => item[7] === 2);

      setDisplayData(filterData);
    }
  };

  return (
    <>
      <CommonSection title={"Donate or Mint LIFE in the various Eras"} />

      <section>
        <Container>
          <Row>
            <Col lg="12" className="mb-5">
              <div className="market__product__filter d-flex align-items-center justify-content-between">
                <div className="filter__right">
                  <select onChange={handleSort}>
                    <option value="none">Sort By</option>
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                    <option value="paid">Winners Paid</option>
                  </select>
                </div>
              </div>
            </Col>

            {displayData?.map((item) => (
              <Col lg="3" md="4" sm="6" className="mb-4" key={item[5]}>
                <EraCard item={item} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Eras;
