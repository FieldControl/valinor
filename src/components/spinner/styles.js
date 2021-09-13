import styled, { keyframes } from 'styled-components';

const Spin = keyframes`
  from {
    transform: rotate(0deg);
  } to {
    transform: rotate(360deg);
  }
`;

export const SpinnerContainer = styled.div`
  height: 100vh;
  position: relative;
`;

export const SpinnerLoader = styled.div`
  min-width: 40px;
  min-height: 40px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-right: 5px solid #58a6ff;
  border-radius: 50%;
  animation: ${Spin} 1s linear infinite;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
