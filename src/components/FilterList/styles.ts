import styled, { css } from "styled-components";

interface IFilterButton {
  active: boolean;
}

export const Container = styled.div`
  margin-bottom: 16px;
  background-color: #0d1117;
  display: flex;
  flex-direction: column;
`;

export const Filter = styled.button<IFilterButton>`
  background-color: transparent;
  color: #c9d1d9;
  padding: 8px 16px;
  border: 2px solid #0d1117;
  border-bottom: 1px solid #21262d;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  min-width: 230px;

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  &:hover {
    background-color: #161b22;
    border-color: #161b22;
    cursor: pointer;
  }

  ${({ active }) =>
    active &&
    css`
      border-left-color: #f28065;
      border-top-color: #161b22;
      background-color: #161b22;
      border-top-left-radius: 0;
    `}
`;

export const Amount = styled.p`
  min-width: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  background-color: #6e7681;
  color: #f0f6fc;
  border-radius: 2em;
`;
