import styled from 'styled-components';

export const Container = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  border-radius: 5px;
  padding: 1rem;

  background: var(--white);

  > div {
    display: flex;
    align-items: center;
  }

  > a {
    transition: filter 0.2s;

    &:hover {
      filter: brightness(0.8);
    }
  }

  div img {
    width: 5rem;
    border-radius: 50%;
  }

  div div {
    margin-left: 1.5rem;

    a {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-title);
    }

    p {
      margin-top: 0.2rem;
    }
  }
`;
