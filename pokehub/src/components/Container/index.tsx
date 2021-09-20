import { SearchSection } from "../SearchSection"
import { Content } from './styles';
import { CardsSection } from "../CardsSection";
import { PokemonsProvider } from "../../hooks/usePokemons";

export function Container() {
    return (
        <Content>
            <PokemonsProvider>
                <SearchSection />
                <CardsSection />
            </PokemonsProvider>
        </Content>
    )
}