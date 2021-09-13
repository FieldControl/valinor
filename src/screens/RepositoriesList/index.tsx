import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import LeftSide from "../../components/LeftSide";
import RepoItem from "../../components/RepoItem";
import axios, { constants } from "../../config/api";
import {
  IFilter,
  IRepository,
  RepositoriesCount,
} from "../../config/interfaces";
import GlobalContext from "../../global/GlobalContext";
import debounce from "lodash.debounce";

import { Container, List, Title } from "./styles";

const RepositioriesList: React.FC = () => {
  const [repositories, setRepositories] = useState<IRepository[]>([]);
  const [totalResults, setTotalResults] = useState<RepositoriesCount>();
  const { state }: any = useContext(GlobalContext);

  const fetchData = useCallback((search: string, filter: IFilter) => {
    const { type, language } = filter;

    axios
      .get(`/search/${type.toLowerCase()}`, {
        params: {
          language,
          q: `${search} in:name,description`,
          sort: "stars",
          page: 1,
          client_id: constants.CLIENT_ID,
          client_secret: constants.CLIENT_SECRET,
        },
      })
      .then((res) => {
        setRepositories(res.data.items);
        setTotalResults(res.data.total_count);
        console.log(res);
      })
      .catch((e) => {
        console.log("Não deu certo", { ...e });
      });
  }, []);

  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 500),
    [fetchData]
  );

  useEffect(() => {
    debouncedFetchData(state.search, state.filter);
  }, [debouncedFetchData, state.search, state.filter]);

  return (
    <Container>
      <LeftSide />
      <List>
        <Title>{totalResults} repository results</Title>
        {repositories.map((repository) => (
          <RepoItem key={repository.id} repository={repository} />
        ))}
      </List>
    </Container>
  );
};

export default RepositioriesList;
