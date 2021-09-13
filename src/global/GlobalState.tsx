import { useState } from "react";
import { FilterType } from "../config/constants";
import { IFilter } from "../config/interfaces";
import GlobalContext from "./GlobalContext";

const GlobalState: React.FC = ({ children }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<IFilter>({
    type: FilterType.REPOSITORIES,
    language: undefined,
  });

  const state = {
    search,
    filter,
  };

  const setters = {
    setSearch,
    setFilter,
  };

  const requests = {};

  return (
    <GlobalContext.Provider value={{ state, setters, requests }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalState;
