import Modal from 'react-modal'

Modal.setAppElement("#root")

export function RepositoryModal({ modalIsOpen, handleCloseModal }) {
  
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleCloseModal}
    >
      <h1>teste</h1>
    </Modal>
  );
}