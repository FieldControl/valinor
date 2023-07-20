import React from 'react';
import SearchResults from '../../components/SearchResults';

const Comics: React.FC = () => {
  return (
    <>
      {/* Elementos da página Comics */}
      <SearchResults endpoint="/comics"/>
    </>
  );
};

export default Comics;