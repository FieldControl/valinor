import React, { useContext, useEffect } from 'react';
import { context } from '../../context/data-provider';
import MainContainer from '../../components/container/container';
import ReposContainer from '../../components/repos-container/repos-container';
import axios from 'axios';
import Pagination from '../../components/pagination/pagination';

const Repos = (props) => {
  const value = useContext(context);
  const searchQuery = props.match.params.repoName;
  const [repos] = value.repos;
  const [setRepos] = value.setRepos;
  const [currentPage] = value.currentPage;

  useEffect(() => {
    axios
      .get(
        `https://api.github.com/search/repositories?q=${searchQuery}&page=${currentPage}`
      )
      .then((res) => {
        console.log(res.data);
        setRepos(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [searchQuery, setRepos, currentPage]);

  return (
    <MainContainer>
      <ReposContainer repos={repos.items} />
      <Pagination search={searchQuery} pageLimit={5} dataLimit={10} />
    </MainContainer>
  );
};

export default Repos;
