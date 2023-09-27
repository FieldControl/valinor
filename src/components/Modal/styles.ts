"use client";
import styled from "styled-components";

export const Container = styled.div`
  h2 {
    color: #000;
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;
export const CardRight = styled.div`
  width: 100%;
  height: 100%;
  padding: 1.31rem 1.75rem;

  @media (max-width: 768px) {
    width: 22rem;
    padding: 1rem 1rem;
  }

  @media (max-width: 1024px) {
    width: 22rem;
    padding: 1rem 1rem;
  }
`;

export const HeaderCard = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const Profile = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  .group-profile {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    .avatar {
      clip-path: circle();
    }
  }

  .update{
    display: flex;
    span{
        color: ${props => props.theme.colors.primary100};
    }
  }
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

export const Github = styled.div`
  margin-top: 1rem;
  color: ${props => props.theme.colors.primary100};
  a {
    display: flex;
    gap: 0.5rem;
    text-decoration: none;
  }
`;
