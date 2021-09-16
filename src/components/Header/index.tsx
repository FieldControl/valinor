import React, { ChangeEvent, useContext } from "react";
import GlobalContext from "../../global/GlobalContext";
import { Container, GithubLogo, Input } from "./styles";

const Header: React.FC = () => {
  const { state, setters }: any = useContext(GlobalContext);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setters.setSearch(e.target.value);
  };

  return (
    <Container>
      <GithubLogo />
      <Input
        value={state.search}
        onChange={handleInputChange}
        placeholder="Search GitHub"
      />
    </Container>
  );
};

export default Header;
