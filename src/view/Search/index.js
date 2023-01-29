import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import axios, { keysApi } from '../../services/axios';
import { Container, Title } from '../../styles/GlobalStyles';
import { Card, TextCard, CardFlex } from '../Home/styled';

export default function Search() {
  const [character, setCharacter] = useState([]);
  const { name } = useParams();

  useEffect(() => {
    async function getCharacterByName() {
      const response = await axios.get(
        `/characters?name=${name}&ts=${keysApi.ts}&apikey=${keysApi.publicKey}&hash=${keysApi.createHash}`
      );
      setCharacter(response.data.data.results);
    }
    getCharacterByName();
  }, []);

  if (character.length === 0) {
    return (
      <Container>
        <h1>Character not found</h1>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Marvel Character</Title>
      <CardFlex>
        {character.map((charac) => (
          <Link to={`/details/${charac.id}`} key={charac.id}>
            <Card>
              <img
                src={`${charac.thumbnail.path}.${charac.thumbnail.extension}`}
                alt="Character Portrait"
              />
              <TextCard>
                <p>{charac.name}</p>
              </TextCard>
            </Card>
          </Link>
        ))}
      </CardFlex>
    </Container>
  );
}
