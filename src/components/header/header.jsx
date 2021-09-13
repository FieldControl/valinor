import React, { useContext, useState } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { context } from '../../context/data-provider';
import {
  HeaderContainer,
  Logo,
  InputContainer,
  Input,
  SearchButton,
} from './styles';

const Header = () => {
  const [search, setSearch] = useState('');
  const value = useContext(context);
  const [setCurrentPage] = value.setCurrentPage;

  return (
    <HeaderContainer>
      <Logo to="/">
        <AiFillGithub className="github-icon" />
      </Logo>
      <InputContainer>
        <Input
          type="text"
          placeholder="Search a repo..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <SearchButton to={`/repo=${search}`} onClick={() => setCurrentPage(1)}>
          Search
        </SearchButton>
      </InputContainer>
    </HeaderContainer>
  );
};

export default Header;
