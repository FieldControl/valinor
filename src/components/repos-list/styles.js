import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const RepoListContainer = styled.ul`
  width: 100%;
  min-height: 100vh;
`;

export const ListItem = styled.li`
  border-bottom: solid 1px #21262d;
  padding-bottom: 14px;
  padding-top: 20px;
  display: flex;
`;

export const RepoIcon = styled.div`
  padding-top: 3px;
  .repo-icon {
    font-size: 20px;
    color: #6a637d;
  }
`;

export const RepoInfo = styled.div`
  margin-left: 10px;
  .repo-name {
    font-size: 16px;
    color: #58a6ff;
    margin-bottom: 3px;
    &:hover {
      color: #1f6feb;
    }
  }

  p {
    font-size: 14px;
  }

  .repo-status {
    display: flex;
    margin-top: 10px;
    .language-color {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      margin-right: 7px;
    }
    span {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #8b949e;
      margin-right: 15px;
    }
    .icon {
      margin-right: 5px;
      font-size: 20px;
    }
    a {
      color: #8b949e;
      transition: 0.2s ease;
      &:hover {
        color: #1f6feb;
      }
    }
  }
`;
