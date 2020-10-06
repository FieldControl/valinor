import styled, { css, keyframes } from 'styled-components';
import { shade } from 'polished';

interface ILoadingProps {
  loading: boolean;
}

export const Container = styled.main<ILoadingProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 960px;
  height: 100%;
  margin: 0 auto;
  padding: 40px 20px;

  header {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      width: 100px;
      height: 100px;
      margin-bottom: 12px;
    }

    h1 {
      color: #23272a;
    }
  }

  form {
    display: flex;
    margin: 18px 0 60px;
    max-width: 700px;
    width: 100%;
    height: 60px;

    input {
      flex: 1;
      border: 0;
      padding: 0 24px;
      color: #3a3a3a;
      border-radius: 5px 0 0 5px;

      &::placeholder {
        color: #a8a8b3;
      }
    }

    button {
      width: 200px;
      border: 0;
      border-radius: 0 5px 5px 0;
      background-color: #23272a;
      color: #fff;
      font-weight: bold;
      transition: background-color 0.2s;

      &:hover {
        background-color: ${shade(0.5, '#23272a')};
      }
    }
  }

  ${props =>
    props.loading &&
    css`
      svg {
        animation: ${rotate} 2s linear infinite;
      }
    `}
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;
