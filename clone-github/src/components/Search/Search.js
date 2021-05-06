import PropTypes from "prop-types";
import "./Search.scss";
import React, { useState } from "react";

const Search = ({ change, text, changeType, type }) => {
  const [select, setSelect] = useState(false);
  return (
    <div className="search__container">
      <input
        onClick={() => setSelect((prevState) => !prevState)}
        className="search"
        onChange={change}
        type="text"
        value={text}
      />
      {select ? (
        <select
          onChange={changeType}
          className="search__select"
          name="choice"
          value={type}
        >
          <option value="issues">issues</option>
          <option value="repositories">repositories</option>
        </select>
      ) : (
        <span>+</span>
      )}
    </div>
  );
};

Search.propTypes = {
  change: PropTypes.func,
  text: PropTypes.string,
  type: PropTypes.string,

  changeType: PropTypes.func,
};

export default Search;
