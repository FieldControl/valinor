import styled from 'styled-components';
import { primaryDarkColor, primaryColor } from '../../config/colors';

export const Card = styled.div`
  position: relative;
  width: 100%;
  background-color: ${primaryDarkColor};
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  border-radius: 1rem;
  height: 45rem;
  margin-bottom: 3rem;

  &:hover {
    background: ${primaryColor};
  }

  img {
    width: 100%;
    border-radius: 1rem;
    max-height: 28.98rem;
  }
`;
export const TextCard = styled.div`
  padding: 1rem 2rem;
  color: #fff;
  font-size: 2rem;
  height: 12rem;

  p {
    max-width: 100%;
    text-align: center;
  }
`;

export const CardFlex = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  a {
    position: relative;
    width: 30%;
    background-color: ${primaryDarkColor};
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 1rem;
    height: 45rem;
    margin-bottom: 3rem;

    &:hover {
      transition: all 0.2s ease-in-out;
      cursor: pointer;
      background: ${primaryColor};
      top: -7px;
      left: -5px;
    }
  }
`;

export const DivPagination = styled.div`
  display: flex;
  justify-content: flex-end;

  select {
    border-radius: 1rem;
    height: 3.5rem;
    width: 6rem;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    font-size: 1.5rem;
  }
`;
