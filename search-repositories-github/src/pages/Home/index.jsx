import { useGithubData } from '../../hooks/DataContext'

import { BsEye } from 'react-icons/bs'

import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai'

import { HomeContainer, RepositoryCard, Pagination } from "./styles";

export function Home() {
  const { data, handleSetCurrentPage, currentPage } = useGithubData()

  return (
    <HomeContainer>
      {
        data.items && data.items.map((item) => (
            <RepositoryCard key={item.id}>
              <header>
                <a href={item.html_url}>{item.owner.login}/{item.name}</a>
                <p>
                  <strong>{item.description}</strong>
                </p>
              </header>
              {
                item.topics.length > 0 ? (
                <section>
                  {
                    item.topics.map((topic, index) => (<button key={index} type="button">{topic}</button>))
                  }
                </section>
                ) : ('')
              }
              <section >
                <p className="watchers">
                  <BsEye size={16} />
                  {item.watchers}
                </p>

                <p>stars</p>
                
                <p>
                  {item.language}
                </p>

                {
                  item.license !== null ? (
                    <p>{item.license.name}</p>
                  ) : ('')
                }

                <p>
                  {new Date(item.updated_at).getTime()}
                </p>
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
                  // se for maior que um ele vai diminuir a numeração da página
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