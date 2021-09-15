import React, { useContext, useEffect } from "react";
import RepoItem from "../components/RepoItem";

import GlobalContext from "../global/GlobalContext";

import ReactPaginate from "react-paginate";
import Octocat from "../assets/images/octocat.png";

import {
  Container,
  ContentContainer,
  List,
  Title,
  PaginationContainer,
  Image,
} from "./styles";
import { IPagination } from "../config/interfaces";
import { abbreviateNumber } from "../utils/format";
import Loader from "../components/Loader";

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

  const renderRepositories = () =>
    state.isLoading ? (
      <Loader />
    ) : (
      <>
        <List>
          <Title>
            {abbreviateNumber(state.totalResults)} repository results
          </Title>
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
            marginPagesDisplayed={1}
            pageRangeDisplayed={2}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </PaginationContainer>
      </>
    );

  return (
    <Container>
      <ContentContainer>
        {state.repositories.length > 0 ? (
          renderRepositories()
        ) : (
          <Image src={Octocat} />
        )}
      </ContentContainer>
    </Container>
  );
};

export default RepositioriesList;
