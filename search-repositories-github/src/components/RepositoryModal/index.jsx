import { useEffect, useState } from 'react'
import Modal from 'react-modal'

import { AiOutlineClose } from 'react-icons/ai'

import {  ModalContent, ModalHeader, OwnerInfo, RepositoryInfo } from './styles'
import { useGithubData } from '../../hooks/DataContext';

Modal.setAppElement("#root")

/**
 * Componente RepositoryModal
 * renderiza o modal para exibir as informações do repositório em destaque.
 * @param {*} modalIsOpen valor booleano contendo se o modal está fechado ou não
 * @param {*} handleCloseModal função para fechar o modal
 * @param {*} repositoryData dados do repositório atual
 * @returns RepositoryModal React Component
 */
export function RepositoryModal({ modalIsOpen, handleCloseModal, repositoryData }) {
  const [languages, setLanguages] = useState([])
  const [issuesData, setIssuesData] = useState({ total_count: 0, items: [] })
  
  const { getLanguages, getIssuesFromRepository } = useGithubData()

  const { 
    name,
    description,
    owner
  } = repositoryData

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };
  
  useEffect(() => {
  
    getIssuesFromRepository(owner.login, name, setIssuesData)

    getLanguages(owner.login, name, setLanguages)
  }, [repositoryData])

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleCloseModal}
      style={customStyles}
    >
      <ModalContent>
        <AiOutlineClose 
          size={20} 
          onClick={handleCloseModal}
        />
        
        <OwnerInfo>
          <img src={`${owner.avatar_url}`} alt={`Foto de ${owner.login}`} />
          <p>{owner.login}</p>
        </OwnerInfo>

        <ModalHeader>
          <h3>{name}</h3>
          <p>{description}</p>
        </ModalHeader>

        <RepositoryInfo>
          {
            languages.map((language, index) => (<p className="focus" key={index}>{language}</p>))
          }

          <section>
            <h4>Issues</h4>
            {
              issuesData.items.map(issue => (
                <article key={issue.id}>
                  <p>
                    <a target="blank" href={`${issue.html_url}`}>
                      {issue.title}
                    </a>
                  </p>

                  <p>
                    Username: {issue.user.login}
                  </p>
                </article>
              ))
            }
          </section>
        </RepositoryInfo>
      </ModalContent>
    </Modal>
  );
}