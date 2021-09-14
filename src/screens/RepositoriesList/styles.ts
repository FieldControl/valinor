import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ContentContainer = styled.div`
  display: flex;
  margin: 24px 218px 0px 218px;
  display: flex;
  flex-direction: column;

  @media (max-width: 800px) {
    margin: 24px 15px;
  }
`;

export const List = styled.div`
  background-color: #0d1117;
  padding-right: 8px;
  padding-left: 8px;
`;

export const Title = styled.h3`
  color: #c9d1d9;
  font-size: 20px;
  padding-bottom: 16px;
`;

export const PaginationContainer = styled.div`
  .pagination {
    color: #f0f6fc;
    margin: 35px auto;
    display: flex;
    list-style: none;
    outline: none;
    width: 100%;
    justify-content: center;
  }

  .pagination > .active > a {
    background-color: #1f6feb;
  }

  .pagination > li > a {
    border: none;
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
    background-color: #1f6feb;
    border-color: #47ccde;
    outline: none;
    min-width: 32px;
    padding: 5px 10px;
    font-style: normal;
    line-height: 20px;
    border-radius: 6px;
  }

  .pagination > li > a,
  .pagination > li > span {
    color: #c9d1d9;
  }

  .pagination > li:first-child > a,
  .pagination > li:first-child > span,
  .pagination > li:last-child > a,
  .pagination > li:last-child > span {
    border-radius: unset;
  }

  @media (max-width: 768px) {
    .pagination > li:not(.next):not(.previous) {
      display: none;
    }
  }
`;
