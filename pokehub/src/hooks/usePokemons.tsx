import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { pokeApi } from "../services/pokeApi";

interface Pokemon {
    name: string,
    sprite: string,
    hp: string,
    attack: string,
    deffense: string,
    specialAttack: string
}

interface PokemonProviderProps {
    children: ReactNode
}

interface PokemonsContextData {
    pokemons: Pokemon[],
    setPokemons: (pokemons: Pokemon[]) => void;
}

const PokemonsContext = createContext<PokemonsContextData>(
    {} as PokemonsContextData
);

export function PokemonsProvider({ children }: PokemonProviderProps) {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);

    useEffect(() => {
        pokeApi.get('/pokemon/?limit=6')
            .then(async response => {
                const pokemonsResponse = response.data.results;
                let pokemons: Pokemon[] = [];

                await Promise.all(pokemonsResponse.map(async (pokemon: any) => {
                    return (
                        pokeApi.get(pokemon.url)
                            .then(responsePokemonInfo => {
                                const pokemonInfo = {
                                    name: pokemon.name,
                                    sprite: responsePokemonInfo.data.sprites.other['official-artwork'].front_default,
                                    hp: responsePokemonInfo.data.stats[0].base_stat,
                                    attack: responsePokemonInfo.data.stats[1].base_stat,
                                    deffense: responsePokemonInfo.data.stats[2].base_stat,
                                    specialAttack: responsePokemonInfo.data.stats[3].base_stat,
                                }
                                pokemons.push(pokemonInfo);
                            }
                            )
                    )
                }))
                setPokemons(pokemons);
            });
    }, [])

    return (
        <PokemonsContext.Provider value={{ pokemons, setPokemons }}>
            {children}
        </PokemonsContext.Provider>
    )
}

export function usePokemons() {
    const context = useContext(PokemonsContext);

    return context;
}