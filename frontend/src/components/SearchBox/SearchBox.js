import React from "react";
import styles from "./search.module.css";

const SearchBox = ({ value, setSearchValue }) => {
  return (
    <div className={styles.container}>
      <input
        className={styles.inputText}
        value={value}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Type to search..."
      ></input>
    </div>
  );
};

export default SearchBox;
