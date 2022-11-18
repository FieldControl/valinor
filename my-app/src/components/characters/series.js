import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";



// card das series ..dados vindo da API//

const Series = ({ series }) => {

    return (
        <div className="col-4 mb-3">
            <Container >
                <Card style={{ Width: '18rem' }}>
                    <Card.Img variant="top" src={`${series.thumbnail.path}.${series.thumbnail.extension}`} width={300} height={180} alt={series.title} />
                    <Card.Body>
                        <Card.Title className="titulo">{series.title}</Card.Title>
                        <Card.Text>
                            {[series.url]}
                        </Card.Text>
                        <Button variant="primary"><Link to={`/seriesid/${series.id}`} className='linkDetalhes'> Detalhes</Link></Button>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}
export default Series;