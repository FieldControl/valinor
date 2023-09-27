import Modal from "react-modal";
import { GitHubRepository } from "../../types/repositories";
import { Container } from "./styles";

interface ModalTransactionProps {
  isOpen: boolean;
  onRequestClose: () => void;
  selectedRepo: GitHubRepository | null;
}

export const ModalInfo = ({
  isOpen,
  onRequestClose,
  selectedRepo,
}: ModalTransactionProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="react-modal-overlay"
      className="react-modal-content"
    >
      {selectedRepo && (
        <Container>
          <h2>{selectedRepo.name}</h2>
          <p>{selectedRepo.description}</p>
        </Container>
      )}
    </Modal>
  );
};
