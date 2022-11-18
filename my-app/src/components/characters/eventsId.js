import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";



// events sendo chamadas a trave de ID//

const EventsId = () => {
    const { id } = useParams()
    const [state, setState] = useState([])

    useEffect(() => {
        async function loadEventsId() {
            const response = await api.get(
                `/events/${id}`);

            setState(response.data.data.results)
            console.log(response.data.data.results)
        }



        loadEventsId();

    }, []);


    return (

        <Container className="home">

            {
                state.map((events, id) => {
                    return (

                        <Card key={id}>

                            <Card.Img variant="top" style={{ Width: '180rem' }} src={`${events.thumbnail.path}.${events.thumbnail.extension}`} width={300} height={180} alt={events.title} />
                            <Card.Body>
                                <Card.Title className="titulo">{events.title}</Card.Title>
                                <Card.Text>
                                    Description: {events.description}
                                </Card.Text>

                                <Card.Text>
                                    Modified: {events.modified}
                                </Card.Text>
                                <Button ><Link to="/events" className='linkDetalhes'> voltar</Link></Button>
                            </Card.Body>
                        </Card>

                    )
                })

            }
        </Container>
    )
}
export default EventsId;