import Modal from 'react-modal'

import {  ModalContent, ModalHeader, OwnerInfo } from './styles'

Modal.setAppElement("#root")

export function RepositoryModal({ modalIsOpen, handleCloseModal, repositoryData }) {

  const { 
    name,
    description
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
  
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleCloseModal}
      style={customStyles}
    >
      <ModalContent>
        <ModalHeader>
          <h3>{name}</h3>
          <p>{description}</p>
        </ModalHeader>
        <OwnerInfo>
          <img src="https://avatars.githubusercontent.com/u/1024025?v=4" alt="Foto" />
          <p>Nome do usuario</p>
        </OwnerInfo>
      </ModalContent>
    </Modal>
  );
}