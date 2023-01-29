import React, { useEffect, useState } from 'react';

import { Link, Redirect } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { Card, TextCard, CardFlex, DivPagination } from './styled';
import { Container, Title } from '../../styles/GlobalStyles';
import axios, { keysApi } from '../../services/axios';
import usePagination from '../../hooks/usePagination';

export default function Home() {
  const [characters, setCharacters] = useState([]);
  const [characterName, setCharacterName] = useState('');
  const [redirect, setRedirect] = useState(false);

  const { actualPage, setActualPage } = usePagination();

  useEffect(() => {
    async function getCharacters(page) {
      const virtualPage = (page - 1) * 9;

      const response = await axios.get(
        `/characters?ts=${keysApi.ts}&apikey=${keysApi.publicKey}&hash=${keysApi.createHash}&limit=9&offset=${virtualPage}`
      );
      setCharacters(response.data.data.results);
    }
    getCharacters(actualPage);
  }, [actualPage]);

  function handleClick(e) {
    e.preventDefault();
    setRedirect(true);
  }

  if (redirect) {
    return <Redirect to={`/search/${characterName}`} />;
  }

  return (
    <Container>
      <Title>Marvel Characters</Title>
      <form>
        <label htmlFor="characterName">
          <input
            type="text"
            placeholder="Character Name"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
          />
        </label>
        <button type="submit" onClick={handleClick}>
          <FaSearch size={12} />
        </button>
      </form>
      <CardFlex>
        {characters.map((character) => (
          <Link key={character.id} to={`/details/${character.id}`}>
            <Card>
              <img
                src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                alt="Character Portrait"
              />
              <TextCard>
                <p>{character.name}</p>
              </TextCard>
            </Card>
          </Link>
        ))}
      </CardFlex>
      <DivPagination>
        <select onChange={(e) => setActualPage(e.target.value)}>
          {Array(174)
            .fill('')
            .map((_, index) => {
              return <option key={index + 1}>{index + 1}</option>;
            })}
        </select>
      </DivPagination>
    </Container>
  );
}
