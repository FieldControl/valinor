import styled, { keyframes } from 'styled-components';

import githubBg from '../../images/Github.svg';

export const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;

  background: url(${githubBg}) no-repeat;
  background-position: right top;

  h1 {
    margin-top: 5rem;
    max-width: 433px;

    font-size: 3rem;
    font-weight: 700;
    color: var(--text-title);
  }
`;

export const Form = styled.form`
  margin-top: 2.5rem;

  max-width: 714px;

  input,
  button {
    height: 4.5rem;

    border: 0;
  }

  input {
    padding-left: 1.8rem;
    width: calc(100% - 12rem);
    border-radius: 5px 0 0 5px;

    font-size: 1.25rem;
    color: var(--text-info);
    background-color: var(--white);
  }

  button {
    width: 12rem;
    border-radius: 0 5px 5px 0;

    font-size: 1.125rem;
    font-weight: 700;
    color: var(--white);
    background-color: var(--success);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const CardContainer = styled.ul`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 714px;
  margin: 6rem 0;
  gap: 10px;

  div.loader {
    border: 8px solid var(--gray); /* Light grey */
    border-top: 8px solid var(--text-title); /* Blue */
    border-radius: 50%;

    width: 80px;
    height: 80px;
    margin: 0 auto;

    animation: ${spin} 1s linear infinite;
  }

  span.notFound {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
  }

  div.pagination {
    display: flex;
    justify-content: space-between;

    button {
      display: flex;
      align-items: center;

      border: 0;
      background: transparent;

      font-size: 1rem;
      color: var(--text-title);

      transition: color 0.2s;

      &:hover {
        color: var(--text-info);
      }

      &:disabled {
        cursor: default;
        color: var(--text-info);
      }
    }
  }
`;
