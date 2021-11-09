import { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { api } from '../../services/api';

import {  ModalContent, ModalHeader, OwnerInfo, RepositoryInfo } from './styles'

Modal.setAppElement("#root")

export function RepositoryModal({ modalIsOpen, handleCloseModal, repositoryData }) {
  const [languages, setLanguages] = useState([])
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
      const response = await api.get(`/repos/${username}/${repositoryName	}/languages`)
      const languagesKeys = Object.keys(response.data)
      setLanguages(languagesKeys)
    }

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
            languages.map((language, index) => (<p key={index}>{language}</p>))
          }
        </RepositoryInfo>
      </ModalContent>
    </Modal>
  );
}