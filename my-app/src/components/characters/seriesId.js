import React from "react";
import { Container, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import "../../style/style.css";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";



//chamando as series a traves do ID e será renderizada e  m froma de card//

const SeriesId = () => {
    const { id } = useParams()
    const [state, setState] = useState([])

    useEffect(() => {
        async function loadSeriesId() {
            const response = await api.get(
                `/series/${id}`);

            setState(response.data.data.results)
            console.log(response.data.data.results)
        }



        loadSeriesId();

    }, []);


    return (

        <Container className="home">

            {
                state.map((series, id) => {
                    return (

                        <Card key={id}>

                            <Card.Img variant="top" style={{ Width: '180rem' }} src={`${series.thumbnail.path}.${series.thumbnail.extension}`} width={300} height={180} alt={series.title} />
                            <Card.Body>
                                <Card.Title className="titulo">{series.title}</Card.Title>
                                <Card.Text>
                                    Description: {series.description}
                                </Card.Text>

                                <Card.Text>
                                    Modified: {series.modified}
                                </Card.Text>
                                <Button ><Link to="/series" className='linkDetalhes'> voltar</Link></Button>
                            </Card.Body>
                        </Card>

                    )
                })

            }
        </Container>
    )
}
export default SeriesId;