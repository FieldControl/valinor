import React, { useEffect, useState } from "react";
import RepoItem from "../../components/RepoItem";
import axios, { constants } from "../../config/api";
import { IRepository } from "../../config/interfaces";

import { List } from "./styles";

const RepositioriesList: React.FC = () => {
  const [repositories, setRepositories] = useState<IRepository[]>([]);
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
      })
      .catch((e) => {
        console.log("Não deu certo", { ...e });
      });
  }, [input]);

  return (
    <>
      <List>
        {repositories.map((repository) => (
          <RepoItem key={repository.id} repository={repository} />
        ))}
      </List>
    </>
  );
};

export default RepositioriesList;
