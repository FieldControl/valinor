import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import axios, { keysApi } from '../../services/axios';
import { Container, Title } from '../../styles/GlobalStyles';
import { Div, DivFlexList } from './styled';

export default function Details() {
  const [character, setCharacter] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    async function getCharacterById() {
      const response = await axios
        .get(
          `/characters?id=${id}&ts=${keysApi.ts}&apikey=${keysApi.publicKey}&hash=${keysApi.createHash}`
        )
        .catch(function erro() {
          return '';
        });
      if (response) {
        setCharacter(response.data.data.results);
      } else {
        setCharacter('');
      }
    }

    getCharacterById();
  }, []);

  if (!character) {
    return (
      <Container>
        <h1>ERRO 404</h1>
      </Container>
    );
  }

  return (
    <>
      {character.map((charac) => (
        <Container key={charac.id}>
          <Title>{charac.name}</Title>
          <Div>
            <img
              src={`${charac.thumbnail.path}.${charac.thumbnail.extension}`}
              alt="dasdas"
            />
            <p>
              {charac.description
                ? charac.description
                : 'Nenhuma descrição padrão'}
            </p>
          </Div>
          <DivFlexList>
            <div>
              <h3>Eventos Participados</h3>
              <ul>
                {charac.events.items.map((item) => (
                  <li key={item.name}>{item.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Series Participadas</h3>
              <ul>
                {charac.series.items.map((item) => (
                  <li key={item.name}>{item.name}</li>
                ))}
              </ul>
            </div>
          </DivFlexList>
        </Container>
      ))}
    </>
  );
}
