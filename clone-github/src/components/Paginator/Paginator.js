import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import arrow from "../../assets/arrow.png";

import "./Paginator.scss";
import PropTypes from "prop-types";

const Paginator = ({ click, links }) => {
  const { page } = useLocation();

  let arr = [];
  if (links) {
    for (let i = 0; i < links.length; i++) {
      let element = links[i];
      if (page >= 3 && element.rel === "first") {
        arr[0] = element;
      }

      if (element.rel === "page") {
        arr[2] = element;
      }
      if (element.rel === "prev" && page >= 2) {
        arr[1] = element;
      }
      if (element.rel === "next") {
        arr[3] = element;
      }
      if (element.rel === "last" && element.rel === "next") {
        arr[4] = element;
      }
    }
  }
  return (
    <ul className="paginator">
      {links
        ? arr
            .filter((p) => {
              return p.rel === "prev";
            })
            .map((p, index) => {
              return (
                <li className="paginator__control paginator__prev" key={index}>
                  <NavLink
                    to={{
                      pathname: `/`,
                      page: p.page,
                    }}
                    onClick={click}
                    activeClassName=""
                  >
                    <img src={arrow} alt="arrow prev" />
                  </NavLink>
                </li>
              );
            })
        : null}

      {links
        ? arr.map((p, index) => {
            return (
              <li className="paginator__item" key={index}>
                <NavLink
                  to={{
                    pathname: `/`,
                    page: p.page,
                  }}
                  onClick={click}
                  activeClassName={
                    page === p.page || (page === undefined && p.page === 1)
                      ? "active"
                      : null
                  }
                >
                  {p.page}
                </NavLink>
              </li>
            );
          })
        : null}
      {links
        ? arr
            .filter((p) => {
              return p.rel === "next";
            })
            .map((p, index) => {
              return (
                <li className="paginator__control paginator__next" key={index}>
                  <NavLink
                    to={{
                      pathname: `/`,
                      page: p.page,
                    }}
                    activeClassName=""
                    onClick={click}
                  >
                    <img src={arrow} alt="arrow next" />
                  </NavLink>
                </li>
              );
            })
        : null}
    </ul>
  );
};

Paginator.propTypes = {
  click: PropTypes.func,
  links: PropTypes.array,
};
export default Paginator;
