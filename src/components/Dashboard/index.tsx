import { Container, Content, TitleBox, CardRepository, CardFooter } from './styles';
import { GoRepo } from 'react-icons/go';
import { BsStar } from 'react-icons/bs';
import { SearchDashboard } from '../SearchDashboard'
import { useRepository } from '../../hooks/useRepository';

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
            <GoRepo />
            <ul>
              <li>
                <a href={repositorie.html_url}>
                  {repositorie.full_name}
                </a>
                <strong>{repositorie.description}</strong>
                <CardFooter>
                  <span><BsStar />{repositorie.stargazers_count}</span>
                  <span>{repositorie.forks_count} forks</span>
                  <span>{repositorie.open_issues_count} issues need help</span>
                </CardFooter>
              </li>
            </ul>
          </CardRepository>
        ))}
      </Content>
    </Container>
  )
}