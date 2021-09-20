import logo from '../../assets/logo.png';
import { Container, Content, Circle } from './styles';

export function Header() {
    return (
        <Container>
            <Content>
                <Circle />
                <img src={logo} alt='pokehub' />
            </Content>
        </Container>
    )
}