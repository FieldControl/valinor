import { pokeApi } from "../services/pokeApi";

interface Pokemon {
    name: string,
    sprite: string,
    hp: string,
    attack: string,
    deffense: string,
    specialAttack: string
}

export async function getPokemonsInfo(offsetParam?: number) {
    let offset = offsetParam ? offsetParam : 0;

    let pokemons: Pokemon[] = [];

    try {
        await pokeApi.get(`/pokemon/?offset=${offset}&limit=6`)
            .then(async response => {
                const pokemonsResponse = response.data.results;

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
                    );
                }));
            });
    } catch (err) {
        console.log(err);
    }

    return pokemons;
}