import { Container, Content, TitleBox, CardRepository, CardFooter, Icon } from './styles';
import { GoRepo } from 'react-icons/go';
import { BsStar, BsEye } from 'react-icons/bs';
import {FaHandsHelping, FaCode} from 'react-icons/fa';
import { SearchDashboard } from '../SearchDashboard'
import { useRepository } from '../../hooks/useRepository';
import { Pagination } from '../Pagination';
import { Footer } from '../Footer';

export const Dashboard: React.FC = () => {
  const { RepositoriesCard } = useRepository();

  

  return (
    <Container>
      <Content>
        <SearchDashboard />
        <TitleBox>
          <h1>{RepositoriesCard.length} repository results</h1>
        </TitleBox>
        {RepositoriesCard.map(repositorie => (
          <CardRepository key={repositorie.id}>
           <Icon>
            <GoRepo />
           </Icon> 
            <ul>
              <li>
                <a rel="noreferrer" target='_blank' href={repositorie.html_url}>
                  {repositorie.full_name}
                </a>
                <strong>{repositorie.description}</strong>
                <CardFooter>
                  <span><BsStar />{repositorie.stargazers_count}</span>
                  <span><FaCode />{repositorie.language}</span>
                  <span><BsEye/>{repositorie.watchers_count} watchers</span>
                  <span><FaHandsHelping/>{repositorie.open_issues_count} issues need help</span>
                </CardFooter>
              </li>
            </ul>
          </CardRepository>
        ))}
        <Pagination/>
      </Content>
      <Footer/>
    </Container>
  )
}