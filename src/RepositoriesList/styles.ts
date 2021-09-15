import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Image = styled.img`
  height: 400px;
  width: auto;
  max-width: 100%;

  @media (max-width: 418px) {
    height: auto;
  }
`;
export const ContentContainer = styled.div`
  display: flex;
  margin: 34px 218px 34px 218px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 800px) {
    margin: 24px 15px;
  }
`;

export const List = styled.div`
  background-color: #fff;
  padding-right: 8px;
  padding-left: 8px;
`;

export const Title = styled.h3`
  color: #24292f;
  font-size: 20px;
  padding-bottom: 16px;
`;

export const PaginationContainer = styled.div`
  .pagination {
    font-size: 14px;
    color: #000;
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
    border-radius: 6px;
    min-width: 32px;
    padding: 5px 10px;
    font-style: normal;
    line-height: 20px;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
  }

  .pagination > li > a,
  .pagination > li > span {
    color: #000;
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
