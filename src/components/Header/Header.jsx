import React, { useRef, useEffect } from "react";

import "./header.css";
import { Container } from "reactstrap";
import logo from "../../assets/images/whitelogo.png";

import { NavLink } from "react-router-dom";
import ButtonConnect from "../ui/Buttonconnect/ButtonConnect";

const NAV__LINKS = [
  {
    display: "Home",
    url: "/home",
  },
  {
    display: "Create",
    url: "/create",
  },
  {
    display: "Eras",
    url: "/era",
  },
];

const Header = () => {
  const headerRef = useRef(null);

  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.classList.add("header__shrink");
      } else {
        headerRef.current.classList.remove("header__shrink");
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle("active__menu");

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <div className="navigation">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>

          <div className="nav__menu" ref={menuRef} onClick={toggleMenu}>
            <ul className="nav__list">
              {NAV__LINKS.map((item, index) => (
                <li className="nav__item" key={index}>
                  <NavLink
                    to={item.url}
                    className={(navClass) =>
                      navClass.isActive ? "active" : ""
                    }
                  >
                    {item.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav__right d-flex align-items-center gap-5 ">
            <ButtonConnect />

            <span className="mobile__menu">
              <i className="ri-menu-line" onClick={toggleMenu}></i>
            </span>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
