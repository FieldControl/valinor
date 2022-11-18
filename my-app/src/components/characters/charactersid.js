import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";




 // --requisicao dos personagens a traves do ID --//
const CardId = () => {
    const { id } = useParams()
    const [state, setState] = useState([])

    useEffect(() => {
        async function loadCharactersId() {
            const response = await api.get(
                `/characters/${id}`);

            setState(response.data.data.results)
            console.log(response.data.data.results)
        }



        loadCharactersId();

    }, []);

// mapenado o personagens a traves do ID  que será renderizado numa Card
    return (

        <Container className="home">

            {
                state.map((characters, id) => {
                    return (

                        <Card key={id}>

                            <Card.Img variant="top" style={{ Width: '180rem' }} src={`${characters.thumbnail.path}.${characters.thumbnail.extension}`} width={300} height={180} alt={characters.name} />
                            <Card.Body>
                                <Card.Title className="titulo">{characters.name}</Card.Title>
                                <Card.Text>
                                    Description: {characters.description}
                                </Card.Text>

                                <Card.Text>
                                    Modified: {characters.modified}
                                </Card.Text>
                                <Button ><Link to="/characters" className='linkDetalhes'> voltar</Link></Button>
                            </Card.Body>
                        </Card>

                    )
                })

            }
        </Container>
    )
}
export default CardId;