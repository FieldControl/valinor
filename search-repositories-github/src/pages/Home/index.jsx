import { useState } from 'react'
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai'

import { useGithubData } from '../../hooks/DataContext'
import { RepositoryModal } from '../../components/RepositoryModal';
import { RepositoryCard } from '../../components/RepositoryCard'
import { HomeContainer, Pagination } from "./styles";

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
          <RepositoryCard 
            item={item}
            key={item.id}
            handleOpenModal={handleOpenModal}
            setCurrentRepositoryInModal={setCurrentRepositoryInModal}
          />    
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