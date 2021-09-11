import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  HeaderContainer,
  Logo,
  InputContainer,
  Input,
  SearchButton,
} from './styles';

const Header = () => {
  const [search, setSearch] = useState('');

  return (
    <HeaderContainer>
      <Logo>GitHub Repo's</Logo>
      <InputContainer>
        <Input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to={`/repo=${search}`}>
          <SearchButton>Search</SearchButton>
        </Link>
      </InputContainer>
    </HeaderContainer>
  );
};

export default Header;
