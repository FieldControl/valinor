import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Input, Button } from 'reactstrap';

import logo from '~/assets/logo.png';
import Footer from '~/components/Footer';

import './styles.css';

function Home() {
  const [search, setSearch] = useState('');
  const history = useHistory();

  function handleSubmit(event) {
    event.preventDefault();

    history.push(`/search?q=${search}`);
  }

  return (
    <Container>
      <Row>
        <Col xl="12" className="mt-9em">
          <div className="d-flex justify-content-center">
            <img width="222" src={logo} alt="Octacat Logo Home" />
            <span className="title-logo">
              Busca <br /> <b>Repositórios</b>
            </span>
          </div>
          <Col xl="12" className="mt-5">
            <form onSubmit={handleSubmit}>
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="home-search-input"
                placeholder="Pesquise..."
                autoFocus
                required
              />
              <Button
                type="submit"
                color="primary"
                block
                className="home-search-button"
              >
                Buscar
              </Button>
            </form>
          </Col>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
}

export default Home;
