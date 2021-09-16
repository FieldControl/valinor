import React, { useContext, useEffect } from "react";
import RepoItem from "../RepoItem";

import GlobalContext from "../../global/GlobalContext";

import ReactPaginate from "react-paginate";
import Octocat from "../../assets/images/octocat.png";

import {
  Container,
  ContentContainer,
  List,
  Title,
  PaginationContainer,
  Image,
  EmptyListText,
} from "./styles";
import { IPagination, IRepository } from "../../config/interfaces";
import { abbreviateNumber } from "../../utils/format";
import Loader from "../Loader";

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

  const renderRepositories = () => (
    <>
      <List>
        <Title>{abbreviateNumber(state.totalResults)} repository results</Title>
        {state.repositories.map((repository: IRepository) => (
          <RepoItem key={repository.id} repository={repository} />
        ))}
      </List>

      <PaginationContainer>
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          breakLabel="..."
          breakClassName="break-me"
          pageCount={
            state.totalResults
              ? state.totalResults / state.pagination.itemsPerPage
              : 0
          }
          marginPagesDisplayed={1}
          pageRangeDisplayed={2}
          onPageChange={handlePageClick}
          containerClassName="pagination"
          activeClassName="active"
        />
      </PaginationContainer>
    </>
  );

  const renderContent = () => {
    if (state.isLoading) return <Loader />;

    if (!state.repositories.length)
      return (
        <>
          <Image src={Octocat} />
          <EmptyListText>
            Faça a sua busca por repositórios preenchendo o campo acima
          </EmptyListText>
        </>
      );

    return renderRepositories();
  };

  return (
    <Container>
      <ContentContainer>{renderContent()}</ContentContainer>
    </Container>
  );
};

export default RepositioriesList;
