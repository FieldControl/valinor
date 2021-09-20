import { Container } from './styles';
import { Header } from '../Header';
import { SearchPokemon } from '../SearchPokemon';
import { Footer } from '../Footer';

export function SearchSection() {
    return (
        <Container>
            <Header />
            <SearchPokemon />
            <Footer />
        </Container>
    )
}