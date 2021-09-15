import styled, { keyframes } from "styled-components";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export const Container = styled.div``;

const rotationAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;

export const LoaderIcon = styled(AiOutlineLoading3Quarters)`
  animation: ${rotationAnimation} 1s ease infinite;
  color: #000;
`;
