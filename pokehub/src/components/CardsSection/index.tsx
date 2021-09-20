import { Container, StyledPaginateContainer, Content } from './styles';
import { Card } from '../Card/';
import { useState } from 'react';
import { usePokemons } from '../../hooks/usePokemons';
import { getPokemonsInfo } from '../../utils/getPokemonsInfo';
import ReactPaginate from 'react-paginate';
import { Loading } from '../Loading';

interface SelectedItem {
    selected: number
}

export function CardsSection() {
    const { pokemons } = usePokemons();
    const { setPokemons } = usePokemons();

    const [isLoading, setIsLoading] = useState(false);

    async function handlePageClick(data: SelectedItem) {
        const page = data.selected;
        const offset = page * 6;
        setIsLoading(true);

        const pokemons = await getPokemonsInfo(offset);

        setPokemons(pokemons);
        setIsLoading(false);
    }

    return (
        <Container>
            {
                (isLoading) &&
                <Loading />
            }
            <Content>
                {pokemons.map(pokemon => {
                    return (
                        <Card key={pokemon.name} pokemon={pokemon} />
                    )
                })}
            </Content>
            <StyledPaginateContainer>
                <ReactPaginate
                    previousLabel={'previous'}
                    nextLabel={'next'}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    pageCount={60}
                    pageRangeDisplayed={1}
                    marginPagesDisplayed={1}
                    onPageChange={handlePageClick}
                    containerClassName={'pagination'}
                    activeClassName={'active'}
                />
            </StyledPaginateContainer>
        </Container>
    )
}