import { Content, PokemonName, PokemonImage, PokemonInfo } from './styles';

export function Card(props: any) {
    return (
        <Content>
            <PokemonName>{props.pokemon.name}</PokemonName>
            <PokemonImage>
                <img src={props.pokemon.sprite} alt="pokemon_image" />
            </PokemonImage>
            <PokemonInfo>
                Status
                <ul>
                    <li>
                        hp: {props.pokemon.hp}
                    </li>
                    <li>
                        attack: {props.pokemon.attack}
                    </li>
                    <li>
                        deffense: {props.pokemon.deffense}
                    </li>
                    <li>
                        special-attack: {props.pokemon.specialAttack}
                    </li>
                </ul>
            </PokemonInfo>
        </Content>
    )
}