import { useCallback, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import axios, { constants } from "../config/api";
import { FilterType } from "../config/constants";
import {
  IFilter,
  IPagination,
  IRepository,
  RepositoriesCount,
} from "../config/interfaces";
import GlobalContext from "./GlobalContext";

const GlobalState: React.FC = ({ children }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<IFilter>({
    type: FilterType.REPOSITORIES,
    language: undefined,
  });
  const [pagination, setPagination] = useState<IPagination>({
    page: 1,
    itemsPerPage: 30,
  });
  const [repositories, setRepositories] = useState<IRepository[]>([]);
  const [totalResults, setTotalResults] = useState<RepositoriesCount>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    (search: string) => {
      if (!search.length) return;

      setIsLoading(true);
      axios
        .get("/search/repositories", {
          params: {
            q: `${search} in:name,description`,
            sort: "stars",
            page: pagination.page,
            per_page: pagination.itemsPerPage,
            client_id: constants.CLIENT_ID,
            client_secret: constants.CLIENT_SECRET,
          },
        })
        .then((res) => {
          setRepositories(res.data.items);
          setTotalResults(res.data.total_count);
          setIsLoading(false);
        })
        .catch((e) => {
          console.log("Não deu certo", { ...e });
          setIsLoading(false);
        });
    },
    [pagination.itemsPerPage, pagination.page]
  );
  console.log(isLoading);

  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 500),
    [fetchData]
  );

  const state = {
    search,
    filter,
    pagination,
    repositories,
    totalResults,
    isLoading,
  };

  const setters = {
    setSearch,
    setFilter,
    setPagination,
    setIsLoading,
  };

  const requests = {
    fetchData: debouncedFetchData,
  };

  return (
    <GlobalContext.Provider value={{ state, setters, requests }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalState;
