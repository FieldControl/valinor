import PropTypes from "prop-types";
import "./Search.scss";
import React, { useState } from "react";

/**
 * Component for search .
 *
 * @component
 * @example
 * <Search
 * change={() => change()}
 * text="something"
 * changeType="issues"
 * type="issues"
 * click={() => click()}
 * />
 *
 * Search
 * @param   {string} change Gets called when the user change a text in input
 * @param   {string} text  value of input
 * @param   {string} type  value of select tag
 * @param   {function} changeType Gets called when the user click in select  tag
 * @param   {function}  click Gets called when the user clicks on the button
 */

const Search = ({ change, text, changeType, type, click }) => {
  const [select, setSelect] = useState(false);
  return (
    <div className="search__container">
      <label className="search__label" htmlFor="search">
        {text && text.length ? null : "Search or jump to..."}
      </label>
      <input
        id="search"
        data-testid="input"
        onClick={() => setSelect((prevState) => !prevState)}
        className="search"
        onChange={change}
        type="text"
        value={text}
        autoComplete="off"
      />
      {select ? (
        <select
          onChange={changeType}
          className="search__select"
          name="choice"
          value={type}
          onClick={click}
        >
          <option value="issues">issues</option>
          <option value="repositories">repositories</option>
        </select>
      ) : (
        <span data-testid="+">+</span>
      )}
    </div>
  );
};

Search.propTypes = {
  change: PropTypes.func,
  text: PropTypes.string,
  type: PropTypes.string,
  changeType: PropTypes.func,
  click: PropTypes.func,
};

export default Search;
