import { FormEvent, useState } from 'react';
import { pokeApi } from '../../services/pokeApi';
import { usePokemons } from '../../hooks/usePokemons';
import { getPokemonsInfo } from '../../utils/getPokemonsInfo';

import { Container, Content } from './styles';

import searchIcon from '../../assets/searchIcon.png';

export function SearchPokemon() {
    const [pokemonInput, setPokemonInput] = useState('');
    const [notFound, setNotFound] = useState(false);
    const { setPokemons } = usePokemons();

    async function handleSearchPokemon(event: FormEvent) {
        event.preventDefault();

        if (pokemonInput === '') {
            const pokemons = await getPokemonsInfo();
            setPokemons(pokemons);
            return;
        }

        try {
            pokeApi.get(`/pokemon/${pokemonInput}`)
                .then(response => {
                    const pokemonInfo = [{
                        name: pokemonInput,
                        sprite: response.data.sprites.other['official-artwork'].front_default,
                        hp: response.data.stats[0].base_stat,
                        attack: response.data.stats[1].base_stat,
                        deffense: response.data.stats[2].base_stat,
                        specialAttack: response.data.stats[3].base_stat,
                    }]

                    setPokemons(pokemonInfo);
                    setNotFound(false);
                })
        } catch (err) {
            console.log('teste');
            setNotFound(true);
            return;
        }
    }

    return (
        <Container onSubmit={handleSearchPokemon}>
            <Content>
                <strong>Search for your favorite pokemon!</strong>
                <input
                    type="text"
                    placeholder="Type the pokemon name here"
                    value={pokemonInput}
                    onChange={(event) => setPokemonInput(event.target.value)}
                />
                <button>
                    <img src={searchIcon} alt="search" />
                </button>
                {
                    (notFound) &&
                    <p>Pokemon not found</p>
                }
            </Content>
        </Container>
    )
}