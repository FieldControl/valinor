import React from 'react';
import MainContainer from '../../components/container/container';
import ReposList from '../../components/repos-list/repos-list';
import Pagination from '../../components/pagination/pagination';
import { useParams } from 'react-router';

const Repos = () => {
  const { repoName } = useParams();

  return (
    <MainContainer>
      <ReposList searchQuery={repoName} />
      <Pagination />
    </MainContainer>
  );
};

export default Repos;
