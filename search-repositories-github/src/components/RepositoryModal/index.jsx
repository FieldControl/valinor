import { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { api } from '../../services/api';

import {  ModalContent, ModalHeader, OwnerInfo, RepositoryInfo } from './styles'

Modal.setAppElement("#root")

export function RepositoryModal({ modalIsOpen, handleCloseModal, repositoryData }) {
  const [languages, setLanguages] = useState([])
  const [issuesData, setIssuesData] = useState({ total_count: 0, items: [] })
  
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
    async function getLanguages(username, repositoryName) {
      if (repositoryName.trim() === "" || username.trim() === "") {
        return;
      }
      const response = await api.get(`/repos/${username}/${repositoryName	}/languages`)
      const languagesKeys = Object.keys(response.data)
      setLanguages(languagesKeys)
    }

    async function getIssuesFromRepository(username, repositoryName) {
      if (repositoryName.trim() === "" || username.trim() === "") {
        return;
      }
  
      const response = await api.get(`/search/issues?q=repo:facebook/react-native`)
      console.log(response.data)
      if (response.status === 200) {
        setIssuesData({ total_count: response.data.total_count, items: response.data.items })
      }
    }

    getIssuesFromRepository(owner.login, name)

    getLanguages(owner.login, name)
  }, [repositoryData])

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleCloseModal}
      style={customStyles}
    >
      <ModalContent>
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