import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";




 // requisicao dos comics a traves de ID //
const ComicsId = () => {
    const { id } = useParams()
    const [state, setState] = useState([])

    useEffect(() => {
        async function loadComicsId() {
            const response = await api.get(
                `/comics/${id}`);

            setState(response.data.data.results)
            console.log(response.data.data.results)
        }



        loadComicsId();

    }, []);

 //mapeando o comics a traves do ID para ser renderizado em froma de card--//
    return (

        <Container className="home">

            {
                state.map((comics, id) => {
                    return (

                        <Card key={id}>

                            <Card.Img variant="top" style={{ Width: '180rem' }} src={`${comics.thumbnail.path}.${comics.thumbnail.extension}`} width={300} height={180} alt={comics.title} />
                            <Card.Body>
                                <Card.Title className="titulo">{comics.Title}</Card.Title>
                                <Card.Text>
                                    Description: {comics.description}
                                </Card.Text>

                                <Card.Text>
                                    Modified: {comics.modified}
                                </Card.Text>
                                <Button ><Link to="/comics" className='linkDetalhes'> voltar</Link></Button>
                            </Card.Body>
                        </Card>

                    )
                })

            }
        </Container>
    )
}
export default ComicsId;