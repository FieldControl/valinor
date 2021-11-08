import {  useEffect, useState } from 'react/cjs/react.development';
import { useGithubData } from '../../hooks/DataContext'

import { HomeContainer, RepositoryCard } from "./styles";

export function Home() {
  const [ repositoriesData, setRepositoriesData] = useState([])
  const { data, handleSetCurrentPage, currentPage } = useGithubData()

  return (
    <HomeContainer>
      {
        data.items && data.items.map((item, index) => (
            <RepositoryCard key={index}>
              <header>
                <p>{item.owner.login}/Repository</p>
                <p>
                  <strong>description</strong>
                </p>
              </header>
              <section>
                <button type="button">Nodejs</button>
                <button type="button">react</button>
                <button type="button">Nodejs</button>
                <button type="button">react</button>
                <button type="button">Nodejs</button>
                <button type="button">react</button>
                <button type="button">Nodejs</button>
                <button type="button">react</button>
                <button type="button">Nodejs</button>
                <button type="button">react</button>
              </section>
              <section >
                <p>stars</p>
                <p>tecnologia</p>
              </section>
            </RepositoryCard>
          )
        )
      }
    </HomeContainer>
  );
}