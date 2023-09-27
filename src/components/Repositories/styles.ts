'use client'
import styled from "styled-components"

export const RepoContainer = styled.div`

`

export const Card = styled.div`
  width: 580px;
  height: 172px;
  border: 1px solid ${(props) => props.theme.colors.bg300};
  border-radius: 5px;
  padding: 1.31rem 1.75rem;
  .tecnologies {
    width: 20px;
    margin-top: .5rem ;
  }
`;

export const HeaderCard = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const TitleCard = styled.h3`
  font-size: 20px;
`;

export const Watchs = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  svg {
    font-size: 1.3rem;
  }
`;

export const GitDetails = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;
export const Detail = styled.div`
  display: flex;
  align-items: center;

  svg {
    font-size: 1.5rem;
  }
`;

export const Description = styled.div`
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-top: 1rem;
`;
