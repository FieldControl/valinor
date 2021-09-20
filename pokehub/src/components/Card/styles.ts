import styled from 'styled-components';
import pokemonBackground from '../../assets/pokemonBackground.jpg';

export const Content = styled.div`
    width: 300px;
    height: 400px;
    padding: 0.5rem;

    background: var(--card-background);
    border: 0.7rem solid var(--card-border);
    border-radius: 0.5rem;

    margin: 10px 40px 10px 40px;
`;

export const PokemonName = styled.div`
    color: #FFF;
    padding: 0.3rem;

    font-size: 1.2rem;
    font-weight: 600;
`;

export const PokemonImage = styled.div`
    background-image: url(${pokemonBackground});
    background-size: cover;
    text-align: center;
    border: 2px solid #FFF;
    border-radius: 5px;

    img {
        width: 150px;
        padding-bottom: 10px;
    }
`;

export const PokemonInfo = styled.div`
    margin-top: 1rem;
    color: #FFF;
    font-size: 1.1rem;
    font-weight: 600;

    ul {
        padding: 0.5rem 0rem 0.5rem 0rem;
        list-style: none;
    }

    li{
        font-size: 1rem;
        font-weight: 400;
    }

`
