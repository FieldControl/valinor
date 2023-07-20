import React from 'react';
import SearchCharacters from '../../components/SearchCharacters';

const Characters: React.FC = () => {
  return (
    <>
      {/* Outros elementos da página Characters */}
      <SearchCharacters endpoint="/characters" />
    </>
  );
};

export default Characters;
