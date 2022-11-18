import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";




// OS COMICS seào renderizados em card  informacao vido da API//
const Comics = ({ comics }) => {

    return (
        <div className="col-4 mb-3">
            <Container >
                <Card style={{ Width: '18rem' }}>
                    <Card.Img variant="top" src={`${comics.thumbnail.path}.${comics.thumbnail.extension}`} width={300} height={180} alt={comics.title} />
                    <Card.Body>
                        <Card.Title className="titulo">{comics.title}</Card.Title>
                        <Card.Text>
                            {[comics.url]}
                        </Card.Text>
                        <Button variant="primary"><Link to={`/comicsid/${comics.id}`} className='linkDetalhes'> Detalhes</Link></Button>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}
export default Comics;