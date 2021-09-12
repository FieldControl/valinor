import React from "react";
import RepoItem from "../../components/RepoItem";

import { List } from "./styles";

const RepositioriesList: React.FC = () => {
  return (
    <>
      <List>
        <RepoItem />
      </List>
    </>
  );
};

export default RepositioriesList;
