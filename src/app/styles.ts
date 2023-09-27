"use client";
import styled from "styled-components";

export const Container = styled.main`
  width: 100%;
  max-width: 1364px;
  margin: 0 auto;
  height: calc(100vh - 83px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;

  .left {
    gap: 48px;
  }

  .right {
    gap: 1rem;
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

export const H1 = styled.h1`
  font-size: 2.5rem;
`;

export const Span = styled.span`
  color: ${(props) => props.theme.colors.primary100};
`;

export const CardLeft = styled.div`
  width: 486px;
  height: 300px;
  border: 1px solid ${(props) => props.theme.colors.bg300};
  border-radius: 5px;
  padding: 2.5rem 2.18rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const DivGroupIcons = styled.div`
  display: flex;
  gap: 0.71rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -1.8rem;
    left: 0;
    height: 4px;
    width: 75px;
    background-color: ${(props) => props.theme.colors.primary100};
  }
`;

//card right home page

export const CardRight = styled.div`
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
