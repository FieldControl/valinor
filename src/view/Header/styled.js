import styled from 'styled-components';
import { primaryDarkColor } from '../../config/colors';

export const Nav = styled.nav`
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  background: ${primaryDarkColor};
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  height: 8.5rem;
  width: 100%;

  div {
    min-width: 120rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-height: 15rem;
  }

  img {
    max-width: 10rem;
    max-height: 4rem;
  }
  a {
    color: #fff;
    font-weight: bold;
  }
`;
