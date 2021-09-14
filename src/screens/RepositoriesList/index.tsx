import React, { useContext, useEffect } from "react";
import RepoItem from "../../components/RepoItem";

import GlobalContext from "../../global/GlobalContext";

import ReactPaginate from "react-paginate";

import {
  Container,
  ContentContainer,
  List,
  Title,
  PaginationContainer,
} from "./styles";
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
    <Container>
      <ContentContainer>
        <List>
          <Title>{state.totalResults} repository results</Title>
          {state.repositories.map((repository: any) => (
            <RepoItem key={repository.id} repository={repository} />
          ))}
        </List>
        <PaginationContainer>
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
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
      </ContentContainer>
    </Container>
  );
};

export default RepositioriesList;
