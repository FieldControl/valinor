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

  div div.info-repo {
    margin-left: 1.5rem;

    a {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-title);
    }

    p {
      margin-top: 0.2rem;
    }

    div {
      display: flex;
      align-items: center;

      margin-top: 0.3rem;
      gap: 0.9rem;

      span.stargazers {
        display: flex;
        align-items: center;
      }

      span {
        font-size: 0.75rem;
        color: #58a6ff;
      }
    }
  }
`;
