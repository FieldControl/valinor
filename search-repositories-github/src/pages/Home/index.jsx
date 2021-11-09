import { useState } from 'react'

import { useGithubData } from '../../hooks/DataContext'

import { BsEye } from 'react-icons/bs'

import { AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineStar } from 'react-icons/ai'

import { HomeContainer, RepositoryCard, Pagination } from "./styles";
import { RepositoryModal } from '../../components/RepositoryModal';

export function Home() {
  const { data, handleSetCurrentPage, currentPage } = useGithubData()
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const [currentRepositoryInModal, setCurrentRepositoryInModal] = useState({
    name: '',
    description: '',
    owner: ''
  })

  function handleCloseModal() {
    setModalIsOpen(false)
  }

  function handleOpenModal() {
    setModalIsOpen(true)
  }

  return (
    <HomeContainer>
      <RepositoryModal 
        modalIsOpen={modalIsOpen}
        handleCloseModal={handleCloseModal}
        repositoryData={currentRepositoryInModal}
      />
      {
        data.items && data.items.map((item) => (
            <RepositoryCard key={item.id} onClick={() => {
              handleOpenModal()
              setCurrentRepositoryInModal(item)
            }}>

              <header>
                <a 
                  target="blank" 
                  href={item.html_url}>
                    {item.full_name}
                  </a>
                <p>
                  {item.description}
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
              <section>
                <p className="watchers">
                  <BsEye size={16} />
                  {item.watchers}
                </p>

                <p>
                  <AiOutlineStar color={'yellow'} size={16} />
                  {item.stargazers_count}
                </p>
                
                <p>
                  {item.language}
                </p>

                {
                  item.license !== null ? (
                    <p>{item.license.name}</p>
                  ) : ('')
                }
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