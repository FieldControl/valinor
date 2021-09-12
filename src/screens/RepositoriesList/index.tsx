import React, { useEffect, useState } from "react";
import LeftSide from "../../components/LeftSide";
import RepoItem from "../../components/RepoItem";
import axios, { constants } from "../../config/api";
import { IRepository, RepositoriesCount } from "../../config/interfaces";

import { Container, List, Title } from "./styles";

const RepositioriesList: React.FC = () => {
  const [repositories, setRepositories] = useState<IRepository[]>([]);
  const [totalResults, setTotalResults] = useState<RepositoriesCount>();
  const [input, setInput] = useState("react");

  useEffect(() => {
    axios
      .get("/search/repositories", {
        params: {
          q: `${input} in:name,description`,
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
  }, [input]);

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
