import styled from "styled-components";

export const List = styled.div`
  background-color: #0d1117;
  padding-right: 8px;
  padding-left: 8px;
`;

export const Container = styled.div`
  display: flex;
  margin: 24px 218px 0px 218px;
`;

export const Title = styled.h3`
  color: #c9d1d9;
  font-size: 20px;
  padding-bottom: 16px;
`;

export const PaginationContainer = styled.div`
  .pagination {
    color: #fff;
    margin: 15px auto;
    display: flex;
    list-style: none;
    outline: none;
  }

  .pagination > .active > a {
    background-color: #47ccde;
    border-color: #47ccde;
    color: #fff;
  }

  .pagination > li > a {
    border: 1px solid #47ccde;
    padding: 5px 10px;
    outline: none;
    cursor: pointer;
  }

  .pagination > .active > a,
  .pagination > .active > span,
  .pagination > .active > a:hover,
  .pagination > .active > span:hover,
  .pagination > .active > a:focus,
  .pagination > .active > span:focus {
    background-color: #47ccde;
    border-color: #47ccde;
    outline: none;
  }

  .pagination > li > a,
  .pagination > li > span {
    color: #47ccde;
  }

  .pagination > li:first-child > a,
  .pagination > li:first-child > span,
  .pagination > li:last-child > a,
  .pagination > li:last-child > span {
    border-radius: unset;
  }
`;
