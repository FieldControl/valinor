import {  useEffect, useState } from 'react';
import { useGithubData } from '../../hooks/DataContext'

import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai'

import { HomeContainer, RepositoryCard, Pagination } from "./styles";

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

      {
        data.items.length > 0 ? (
          <Pagination>
            <strong>
              <AiOutlineArrowLeft 
                size={16}
                onClick={() => {
                  // Se a página atual for 1, executa uma função anônima para não fazer nada e
                  // se for maior que um ele vai diminuir a numerção da página
                  currentPage() === 1 ? ((() => {})()) : handleSetCurrentPage(currentPage() - 1)
                }}
              />
            </strong>
            <strong>{`${currentPage()} / ${data.totalPages}`}</strong>
            <strong>
              <AiOutlineArrowRight 
                size={16} 
                onClick={() => handleSetCurrentPage(currentPage() + 1)}
              />
            </strong>
          </Pagination>
        ) :( '')
      }
    </HomeContainer>
  );
}