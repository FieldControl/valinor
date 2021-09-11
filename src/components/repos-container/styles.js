import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 50px;
`;

export const RepoList = styled.ul`
  width: 75%;
`;

export const ListItem = styled.li`
  border-bottom: solid 1px #d9d0d0;
  padding-bottom: 14px;
  padding-top: 20px;
  display: flex;
`;

export const RepoIcon = styled.div`
  padding-top: 4px;
  .repo-icon {
    font-size: 20px;
  }
`;

export const RepoInfo = styled.div`
  margin-left: 10px;
  .repo-name {
    font-size: 18px;
    color: #1f6feb;
    font-weight: bold;
    margin-bottom: 3px;
  }

  .counts {
    display: flex;
    margin-top: 10px;
    span {
      display: flex;
      align-items: center;
      font-size: 15px;
      color: #535457;
      margin-right: 10px;
    }
    .icon {
      margin-right: 5px;
      font-size: 22px;
      color: #444547;
    }
  }
`;
