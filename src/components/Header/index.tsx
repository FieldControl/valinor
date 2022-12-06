/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@material-ui/core';

import { useStyles } from '../../styles/MaterialUI';

import { Container, GithubLogo, SearchForm, MoonIcon, SunIcon, SearchIcon } from './styles';

import { ThemeName } from '../../styles/themes';

interface Props {
  themeName: ThemeName;
  setThemeName: (newName: ThemeName) => void;
}

const Header: React.FC<Props> = ({ themeName, setThemeName }) => {
  const classes = useStyles();

  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    navigate(`/${search.toLowerCase().trim()}`);
  }

  function toggleTheme() {
    setThemeName(themeName === 'light' ? 'dark' : 'light');
    localStorage.setItem('@Github:theme', themeName === 'light' ? 'dark' : 'light');
  }

  return (
    <Container>
      <Tooltip title="Go to homepage" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <a href="/">
          <GithubLogo />
        </a>
      </Tooltip>
      <SearchForm onSubmit={handleSubmit}>
        <Tooltip title="Inform an username and press enter" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
          <input placeholder="Search username" value={search} onChange={e => setSearch(e.currentTarget.value)} />
        </Tooltip>
        <Tooltip title="Search username on GitHub" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
          <button type={search ? 'submit' : 'button'}>
            <SearchIcon />
          </button>
        </Tooltip>
      </SearchForm>
      <Tooltip title={`Activate ${themeName === 'light' ? 'Dark' : 'Light'} Mode`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="theme">{themeName === 'light' ? <MoonIcon onClick={toggleTheme} /> : <SunIcon onClick={toggleTheme} />}</div>
      </Tooltip>
    </Container>
  );
};

export default Header;
