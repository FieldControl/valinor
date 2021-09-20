import LoadingGif from '../../assets/loadingGif.gif';
import { Container } from './styles';

export function Loading() {
    return (
        <Container>
            <img src={LoadingGif} alt="loading" />
        </Container>
    )
}