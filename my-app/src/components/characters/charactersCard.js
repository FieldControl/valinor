import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";



//-- o personagens serao renderizados em cards com os dados vindos da API--//

const CardCharacters = ({ characters }) => {

  return (
    <div className="col-4 mb-3">
      <Container >
        <Card style={{ Width: '18rem' }}>
          <Card.Img variant="top" src={`${characters.thumbnail.path}.${characters.thumbnail.extension}`} width={300} height={180} alt={characters.name} />
          <Card.Body>
            <Card.Title className="titulo">{characters.name}</Card.Title>
            <Card.Text>
              {[characters.url]}
            </Card.Text>
            <Button variant="primary"><Link to={`/charactersid/${characters.id}`} className='linkDetalhes'> Detalhes</Link></Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
export default CardCharacters;