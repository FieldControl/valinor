import styled from 'styled-components';

import githubBg from '../../images/Github.svg';

export const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;

  background: url(${githubBg}) no-repeat;
  background-position: right top;
`;

export const ContentRepository = styled.main`
  header div.profile {
    display: flex;
    align-items: center;

    img {
      width: 7.5rem;
      border-radius: 50%;
    }

    div {
      margin-left: 2rem;

      strong {
        font-size: 2.25rem;
        color: var(--text-title);
      }

      p {
        font-size: 1.25rem;
      }
    }
  }

  header div.info {
    display: flex;

    margin-top: 2.5rem;

    div {
      font-size: 1.25rem;

      span {
        display: block;

        font-weight: 700;
        font-size: 2.25rem;
        color: var(--text-title);
      }

      & + div {
        margin-left: 5rem;
      }
    }
  }

  > a {
    display: flex;
    align-items: center;

    gap: 0.1rem;
    margin-top: 2rem;
    font-size: 1.125rem;

    transition: color 0.2s;

    &:hover {
      color: var(--text-title);
    }
  }
`;
