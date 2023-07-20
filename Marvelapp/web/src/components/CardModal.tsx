import React from 'react';

type SearchResult = {
  id: string;
  name: string;
  title: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
};

type ModalProps = {
  card: SearchResult;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ card, onClose }) => {
  return (
    <div className="modal">
      <div className="container-modal">
        <img
          src={`${card.thumbnail.path}.${card.thumbnail.extension}`}
          alt={`Foto do ${card.name}`}
        />
        <div className="conteudo">
          <h2>{card.name}</h2>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;