import styled from 'styled-components';

interface IState {
  state: string;
}

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 20px;
  max-width: 1280px;
  padding: 24px 12px;
  margin: 0 auto;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  width: 100%;
  height: 120px;
  background-color: #23272a;
  color: #ffff;

  h1 {
    margin-left: 60px;
  }
`;

export const ContainerCard = styled.a`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 24px;
  margin: 0 auto;
  border: 1px solid #3a3a3a;
  border-radius: 5px;
  background-color: #ffff;
  text-decoration: none;
  color: #3a3a3a;

  p {
    margin: 18px 0;
    color: #3a3a3a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const HeaderCard = styled.header<IState>`
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  span {
    display: block;
    background-color: ${props => (props.state === 'open' ? '#3e0' : '#ff0033')};
    color: #ffff;
    padding: 6px;
    border-radius: 8px;
  }
`;
