import { useRef } from "react";
import classes from "./Search.module.scss";

function Search(props) {
  const inputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();

    props.searchFn(inputRef.current.value, true);
  }

  return (
    <>
      <form onSubmit={submitHandler} role="search">
        <input
          ref={inputRef}
          id="search"
          type="search"
          placeholder="Procurar repositórios"
          autoFocus
          autoComplete="off"
        />
        <button type="submit">Buscar</button>
      </form>
    </>
  );
}

export default Search;
