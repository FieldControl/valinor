import PropTypes from "prop-types";
import "./Search.scss";
import React from "react";

const Search = ({ change, text }) => {
  return (
    <input className="search" onChange={change} type="text" value={text} />
  );
};

Search.propTypes = {
  change: PropTypes.func,
  text: PropTypes.string,
};

export default Search;
