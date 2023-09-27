"use client";
import styled from "styled-components";

export const UserContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
`;

export const UserCard = styled.div`
  width: 15.5rem;
  height: 8.5rem;
  border: 1px solid ${(props) => props.theme.colors.bg300};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-top: 1.18rem;
  backdrop-filter: blur(10px);
`;

export const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Avatar = styled.div`
  width: 4rem;
  height: 4rem;
  clip-path: circle();
`;
export const AvatarDetails = styled.div`
  .repos {
    font-size: 12px;
  }
`;
export const AvatarName = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.primary100};
  font-weight: bold;
`;

export const UserRepositories = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
  justify-content: center;
  gap: 0.5rem 8rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    flex-direction: row;

  }
`;

export const CardRight = styled.div`
  width: 28.75rem;
  height: 8.5rem;
  border: 1px solid ${(props) => props.theme.colors.bg300};
  border-radius: 5px;
  padding: 1.31rem 1.75rem;
  backdrop-filter: blur(10px);

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

  p{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Tecnologies = styled.div`
  font-size: 12px;
`;

export const Controls = styled.div`
  display: flex;
  gap: 5.75rem;
  margin: 2.78rem 0 ;

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

export const ButtonPrev = styled.div`
  display: flex;
  align-items: center;
  width: 4.6rem;
  padding: 0.3rem;
  cursor: pointer;
`;

export const ButtonNext = styled.div`
  display: flex;
  align-items: center;
  width: 4.6rem;
  padding: 0.3rem;
  cursor: pointer;
  
`;
