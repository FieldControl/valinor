import { Container, Content, TitleBox, CardRepository, CardFooter, Icon } from './styles';
import { GoRepo } from 'react-icons/go';
import { BsStar, BsEye } from 'react-icons/bs';
import {FaHandsHelping, FaCode} from 'react-icons/fa';
import { SearchDashboard } from '../SearchDashboard'
import { useRepository } from '../../hooks/useRepository';
import { Pagination } from '../Pagination';
import { Footer } from '../Footer';
import { useState } from 'react';

export const Dashboard: React.FC = () => {
  const {Pageinfo,LIMIT} = useRepository();
  const [offset, setOffset] = useState(0);
  
  
  return (
    <Container>
      <Content>
        <SearchDashboard />
        <TitleBox>
          <h1>
            <strong>
              {Pageinfo?.total_count ? new Intl.NumberFormat('en-IN')
              .format(Pageinfo?.total_count): 0}
            </strong> 
            repository results
          </h1>
        </TitleBox>
        {Pageinfo?.items && Pageinfo.items.map(repositorie => (
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
        <Pagination 
        limit={LIMIT} 
        total={Pageinfo?.total_count || 0} 
        offset={offset} 
        setOffset={setOffset}
        />
      </Content>
      <Footer/>
    </Container>
  )
}