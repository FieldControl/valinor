import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";




// card das events //

const Events = ({ events }) => {

    return (
        <div className="col-4 mb-3">
            <Container >
                <Card style={{ Width: '18rem' }}>
                    <Card.Img variant="top" src={`${events.thumbnail.path}.${events.thumbnail.extension}`} width={300} height={180} alt={events.title} />
                    <Card.Body>
                        <Card.Title className="titulo">{events.title}</Card.Title>
                        <Card.Text>
                            {[events.url]}
                        </Card.Text>
                        <Button variant="primary"><Link to={`/eventsid/${events.id}`} className='linkDetalhes'> Detalhes</Link></Button>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}
export default Events;