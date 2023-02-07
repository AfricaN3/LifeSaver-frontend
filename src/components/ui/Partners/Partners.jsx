import actiononblood from "../../../assets/images/actiononblood.png";
import grantshares from "../../../assets/images/grantshares.png";
import african3 from "../../../assets/images/african3.png";
import Carousel from "react-multi-carousel";
import colorSharp from "../../../assets/images/color-sharp.png";

import "./partners.css";
import "react-multi-carousel/lib/styles.css";

const ourPartners = [
  {
    name: "GrantShares",
    href: "https://grantshares.io/",
    icon: grantshares,
  },
  {
    name: "ActionOnBlood",
    href: "https://www.actiononblood.org/",
    icon: actiononblood,
  },
  {
    name: "AfricaN3",
    href: "https://african3.com/",
    icon: african3,
  },
];

export const Partners = () => {
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <section className="partners" id="partners">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="partners-bx wow zoomIn">
              <h2>Partners</h2>
              <p>
                We are thrilled to be partnering with the following
                organizations.
                <br></br> They assist us in encouraging people to save lives.
              </p>
              <Carousel
                responsive={responsive}
                infinite={true}
                className="owl-carousel owl-theme partners-slider"
              >
                {ourPartners.map((partner, index) => (
                  <div className="item" key={index}>
                    <a href={partner.href} target="_blank" rel="noreferrer">
                      <img src={partner.icon} alt={partner.name} />
                      <h5>{partner.name}</h5>
                    </a>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
      <img
        className="background-image-left"
        src={colorSharp}
        alt="background"
      />
    </section>
  );
};
