'use client'
import styled from "styled-components";

export const RepositoriesContainer = styled.div`
    display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
  justify-content: center;
  gap: 0.5rem 8rem;
  margin-top: 3rem;
`


export const CardRight = styled.div`
  width: 28.75rem;
  height: 8.5rem;
  border: 1px solid ${(props) => props.theme.colors.bg300};
  border-radius: 5px;
  padding: 1.31rem 1.75rem;
  backdrop-filter: blur(10px);
`;

export const HeaderCard = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const TitleCard = styled.h3`
  font-size: 1rem;
`;

export const Watchs = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 12px;
  svg {
    font-size: 1rem;
  }
`;

export const GitDetails = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 12px;
`;
export const Detail = styled.div`
  display: flex;
  align-items: center;
  svg {
    font-size: 1rem;
  }
`;

export const Description = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 12px;
`;

export const Tecnologies = styled.div`
  font-size: 12px;
`;

export const Controls = styled.div`
  display: flex;
  gap: 5.75rem;
  margin: 2.68rem 0;

  button {
    border: none;
    width: 100%;
    background-color: transparent;
    color: ${props => props.theme.colors.primary100};
    
    &:disabled {
    color: #ccc;
   
  }
    cursor: pointer;
  }
`;