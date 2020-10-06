import styled from 'styled-components';

export const Container = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 16px;
  max-width: 700px;
  width: 100%;
  height: 200px;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.034),
    0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06),
    0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086),
    0 100px 80px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s;

  & + a {
    margin-top: 18px;
  }

  &:hover {
    transform: translateX(8px);
  }

  img {
    width: 84px;
    height: 84px;
    margin-right: 18px;
    border-radius: 50%;
    background-color: #f0f0f5;
  }

  svg {
    margin-right: 14px;
  }
`;

export const About = styled.div`
  flex: 1;
  margin: 0 auto;

  h1 {
    color: #23272a;
  }

  p {
    margin: 4px 0 8px;
    color: #3a3a3a;
  }
`;

export const RepositoryData = styled.div`
  display: flex;

  div {
    display: flex;
    justify-content: center;
    align-items: baseline;

    & + div {
      margin-left: 16px;
    }

    svg {
      margin-right: 2px;
    }
  }
`;
