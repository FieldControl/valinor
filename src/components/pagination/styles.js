import styled from 'styled-components';

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 26px;
`;

export const PaginationButton = styled.button`
  cursor: pointer;
  color: #1f6feb;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  font-size: 14px;
  margin: 10px;
  pointer-events: ${(props) =>
    props.lastPage || props.firstPage ? 'none' : 'unset'};
  color: ${(props) =>
    props.lastPage || props.firstPage ? '#8b949e' : '#58a6ff'};
  border: solid 1px transparent;
  border-radius: 6px;
  padding: 7px 12px;
  transition: 0.2s ease;

  &:hover {
    border: solid 1px #1c2026;
  }

  .next-icon,
  .prev-icon {
    font-size: 18px;
    margin-top: 1px;
  }
  .next-icon {
    margin-left: 5px;
  }
  .prev-icon {
    margin-right: 5px;
  }
`;

export const PaginationNumbers = styled.button`
  cursor: pointer;
  color: unset;
  border: solid 1px transparent;
  font-weight: 100;
  font-size: 15px;
  margin: 10px;
  padding: 5px 10px;
  border-radius: 6px;
  transition: 0.2s ease;
  background: ${(props) => (props.active ? '#1f6feb' : 'transparent')};
  display: ${(props) => (props.maxPages ? 'none' : 'unset')};
  pointer-events: ${(props) => (props.maxPages ? 'none' : 'unset')};

  &:hover {
    border: solid 1px #1c2026;
  }
`;
