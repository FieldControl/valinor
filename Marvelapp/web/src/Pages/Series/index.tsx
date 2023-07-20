import React from 'react';
import SearchResults from '../../components/SearchResults';

const Series: React.FC = () => {
  return (
    <>
      {/* Elementos da página Characters */}
      <SearchResults endpoint="/series"/>
    </>
  );
};

export default Series;