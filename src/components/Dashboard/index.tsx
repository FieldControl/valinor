import { Container , Content, TitleBox, CardRepository, CardFooter} from './styles';
import { GoRepo } from 'react-icons/go';
import { BsStar } from 'react-icons/bs';
import {SearchDashboard} from '../SearchDashboard'

export const Dashboard = () => {
  return (
    <Container>
      <Content>
      <SearchDashboard />
        <TitleBox>
          <h1>130 repository results</h1>
        </TitleBox>
      <CardRepository>
        <GoRepo/>
        <ul>    
          <li>
            <a href="https://github.com/BismarckOliveira/GitHub-Explorer">
              Bismarck/Cronometro
           </a>  
            <strong>Marcado Digital de Tempo</strong>
            <CardFooter>
              <span><BsStar/>79k</span>
              <span>Update 4 hours ago</span>
              <span>73 issues need help</span>
            </CardFooter>
          </li>
        </ul>
      </CardRepository>
      <CardRepository>
        <GoRepo/>
        <ul>    
          <li>
            <a href="https://github.com/BismarckOliveira/GitHub-Explorer">
              Bismarck/Cronometro
           </a>  
            <strong>Marcado Digital de Tempo</strong>
            <CardFooter>
              <span><BsStar/>79k</span>
              <span>Update 4 hours ago</span>
              <span>73 issues need help</span>
            </CardFooter>
          </li>
        </ul>
      </CardRepository>
      </Content>
    </Container>
  )
}