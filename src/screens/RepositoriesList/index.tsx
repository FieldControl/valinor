import React, { useContext, useEffect } from "react";
import LeftSide from "../../components/LeftSide";
import RepoItem from "../../components/RepoItem";

import GlobalContext from "../../global/GlobalContext";

import ReactPaginate from "react-paginate";

import { Container, List, Title, PaginationContainer } from "./styles";
import { IPagination } from "../../config/interfaces";

const RepositioriesList: React.FC = () => {
  const {
    state,
    setters: { setPagination },
    requests: { fetchData },
  }: any = useContext(GlobalContext);

  const handlePageClick = ({ selected }: any) => {
    setPagination((pagination: IPagination) => ({
      ...pagination,
      page: selected + 1,
    }));
  };

  useEffect(() => {
    fetchData(state.search);
  }, [fetchData, state.search]);

  return (
    <>
      <Container>
        <LeftSide />
        <List>
          <Title>{state.totalResults} repository results</Title>
          {state.repositories.map((repository: any) => (
            <RepoItem key={repository.id} repository={repository} />
          ))}
        </List>
        <PaginationContainer>
          <ReactPaginate
            previousLabel={"prev"}
            nextLabel={"next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={
              state.totalResults
                ? state.totalResults / state.pagination.itemsPerPage
                : 0
            }
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </PaginationContainer>
      </Container>
    </>
  );
};

export default RepositioriesList;
