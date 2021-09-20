import styled from 'styled-components';
import backgroundPokemons from '../../assets/backgroundPokemons.png';

export const Container = styled.section`
    position: relative;
    background-image: url(${backgroundPokemons});
    background-repeat: no-repeat;
    background-size: cover;

    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
`

export const Content = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
`

export const StyledPaginateContainer = styled.div`
    ul {
        list-style-type: none;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 1rem;
        padding: 1rem;
    }

    li {
        display: inline;
        padding: 1rem;
        cursor: pointer;
    }

    .pagination {
        color: #0366d6;
    }
    .break-me {
        cursor: default;
    }
    .active {
        border-color: transparent;
        background-color: #0366d6;
        color: white;
    }
`