import React, { useCallback,useEffect, useState  } from 'react';
import {FiChevronDown} from 'react-icons/fi'
import api from '../../Services/api';
import Header from '../Header';
import {Container,Cardlist,Card,ButtonMore} from './style'



const Characters = () => {
    const [characters,setCharacters] = useState([])

    useEffect(() => {
        api.get('/characters')
        .then(response => {
         setCharacters(response.data.data.results);
         console.log(characters)
        })
        .catch(err => console.log(err))
    }, [])

const handleMore = useCallback( async () => {
    try {
        const offset = characters.length;
        const response = await api.get('characters',{
            params:{
                offset,
            },
        });

        setCharacters([...characters, ...response.data.data.results])
    } catch (error) {
        console.log(err)
    }
}, [characters])

const [query,setQuery] = useState('')


    
    return (
        <Container>
              <Header />
           
            <Cardlist>
               {characters.map(character => {
                return(
                    <Card key={character.id} thumbnail={character.thumbnail}>
                        <div id="img" />
                        <h2>{character.name}</h2>
                        <p>{character.description}</p>
                    </Card>   
                )
               })}
            </Cardlist>
            <ButtonMore onClick={handleMore}>
                <FiChevronDown size={20} />
                Mais
                <FiChevronDown size={20}/>
            </ButtonMore>
        </Container>
    );
};

export default Characters;