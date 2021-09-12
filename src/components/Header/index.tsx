import React from "react";

import { Container, GithubLogo, SearchForm, Input } from "./styles";

const Header: React.FC = () => {
  return (
    <Container>
      <GithubLogo />
      <SearchForm>
        <Input placeholder="Search GitHub" />
      </SearchForm>
    </Container>
  );
};

export default Header;
