import { IoLogoGithub } from 'react-icons/io';
import { SearchHeader } from '../SearchHeader';
import { Container , Content } from './styles';


export const Header = () => {


 return (
   <Container>
     <Content>
      <IoLogoGithub />
      <SearchHeader />
     </Content>
   </Container>
 )
}