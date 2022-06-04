import SocialIcons from "./SocialIcons";
import { Container } from "./styles/Container.styled";
import { Flex } from "./styles/Flex.styled";
import { StyledFooter } from "./styles/Footer.styled";


export default function Footer() {
    return (
        <StyledFooter>
            <Container>
                <img style={{marginTop:"-30px", marginBottom:"-45px"}} src="./images/logo.png" alt="" />

                <Flex>
          <ul>
            <li>
              Projeto criado por Carlos Frederyco.
              Programando em JavaScript com
              StyledComponents em React.js.
              Utilizando o Visual Studio Code.
            </li>
            <li>+55 (17) 99761-2226</li>
            <li>philadelphoescola@gmail.com</li>
          </ul>
          <ul>
            <li>Sobre Mim</li>
            <li>O Que Eu Faço</li>
            <li>FAQ</li>
          </ul>

          <ul>
            <li>Carreira</li>
            <li>Blog</li>
            <li>Me Contate</li>
          </ul>

          <SocialIcons />
        </Flex>

        <p>&copy; 2022 Github Repository Search. Todos direitos reservados</p>

            </Container>
        </StyledFooter>
    )
}