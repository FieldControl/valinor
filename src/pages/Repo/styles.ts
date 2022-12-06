import styled, { css } from 'styled-components';
import { RiStarLine } from 'react-icons/ri';
import { FaGithub } from 'react-icons/fa';
import { Repositories, Fork, Tag, Check, Commits, Actions, Code, Issues, Insight, PullRequest, Security, Settings, Projects, OverView, Watch } from '../../styles/Icons';

interface LanguageBarProps {
  size: string;
  color: string;
}

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 94px);

  > p {
    font-size: 16px;
  }
`;

export const Header = styled.div`
  padding: 25px 25px 0 25px;
  display: flex;
  height: 150px;
  display: grid;
  grid-template-rows: 50px auto 60px;
  background-color: var(--btn);
`;

export const HeaderInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

export const ForkedInfo = styled.div`
  font-size: 12px;
  padding: 5px 25px;
  > a {
    color: var(--link);
    font-weight: 600;
    text-decoration: none;
  }
`;

export const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;

  ::-webkit-scrollbar-thumb {
    background: var(--gray-light);
  }

  ::-webkit-scrollbar {
    height: 5px !important;
    width: 5px !important;
  }

  div + div {
    margin-left: 10px;
  }

  .content {
    display: flex;
    align-items: center;
    min-width: min-content;
    cursor: pointer;
    border-bottom: 2px solid transparent;

    padding: 14px 16px;

    &:hover {
      border-bottom: 2px solid var(--border);
    }

    .label {
      font-size: 14px;
      padding: 0 7px;
      font-weight: 600;
    }
    .number {
      background: var(--ticker);

      display: inline-block;
      min-width: 20px;
      padding: 0 6px;
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
      text-align: center;
      border: 1px solid transparent;
      border-radius: 2em;
    }
  }

  .active {
    border-bottom: 2px solid var(--orange);

    &:hover {
      border-bottom: 2px solid var(--orange);
    }
  }

  .line {
    display: flex;
    width: 200vw;
    border-bottom: 1px solid var(--border);
    margin-left: -50vw;
  }
`;

export const Loader = styled.div`
  height: calc(100vh - 128px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;

  font-size: 18px;

  > svg {
    margin-top: 3px;
  }

  .repo-credentials {
    display: flex;
    align-items: center;
    > a {
      color: var(--link);
      text-decoration: none;
      height: 20px;

      &:hover,
      &:focus {
        text-decoration: underline;
      }

      &.username {
        margin-left: 8px;
      }

      &.reponame {
        font-weight: 600;
      }
    }
    > span {
      padding: 0 5px;
    }
    @media (max-width: 468px) {
      display: grid;
      grid-template-rows: repeat(1, 1fr);
      margin-left: 15px;
      > .username {
        margin-left: 0 !important;
        font-size: 14px;
      }

      > span {
        display: none;
      }
    }
  }
`;

export const RepoInformation = styled.div`
  padding: 25px;
  width: 100%;
`;

export const RightSide = styled.div`
  height: 100%;
  padding: 60px 25px 30px 25px;
  position: relative;
  border: 1px solid var(--border);
  background-color: var(--btn);
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
  grid-gap: 5%;

  @media (max-width: 560px) {
    grid-template-columns: repeat(1, 1fr);
    padding: 60px 15px 90px 15px;
  }
`;

export const HorizontalBar = styled.div`
  height: 5px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  > div:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  > div:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  > div {
    height: 100%;
  }
  > div + div {
    margin-left: 2px;
  }
`;

export const LanguageBar = styled.div<LanguageBarProps>`
  width: ${props => (props.size ? `${props.size}%` : '100%')};
  background-color: ${props => (props.color ? `${props.color}` : '#fff')};
`;

export const RepoInfoHeader = styled.div`
  height: 50px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  background-color: var(--repoHeader);
  position: absolute;
  width: 100%;
  top: 0;
  display: grid;
  grid-template-columns: auto 100px 170px 120px;
  grid-gap: 10px;
  align-items: center;

  > .empty-repo {
    width: 100%;
    font-size: 14px;
    padding-left: 5px;
  }

  > .commiter {
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    > a {
      display: flex;
      align-items: center;
    }
    > a img {
      max-width: 30px;
      border-radius: 50%;
    }
    > .user {
      font-weight: 600;
    }
    > .message {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    > span {
      font-size: 16px;
      margin-left: 15px;
    }
  }

  > .commiter-sha {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    > svg {
      margin-top: 2px;
    }
    > a {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  > .last-commit {
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  > .number-commits {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    > svg {
      margin-top: 2px;
    }
  }
  a {
    text-decoration: none;
    font-size: 16px;
    margin-left: 5px;
  }
  a:hover {
    color: var(--link);
  }
  @media (max-width: 768px) {
    grid-template-columns: auto 120px;
    > .commiter-sha {
      display: none;
    }
    > .last-commit {
      display: none;
    }
  }
`;

export const Row = styled.div`
  border-bottom: 1px solid var(--border);
  padding: 15px 0;

  > h4 {
    margin-bottom: 20px;
  }

  .link {
    color: var(--link);
    font-size: 13px;
  }

  .languages {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    grid-gap: 10px;
    align-items: center;

    > li {
      display: flex;
      align-items: center;

      > span {
        margin-left: 5px;
        font-size: 14px;
        color: var(--gray);
      }
    }
  }
`;

export const LanguageDot = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${props => (props.color ? props.color : '#8257e5')};
`;

export const ReleaseInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  > .info {
    margin-left: 15px;
    cursor: pointer;
    > a {
      text-decoration: none;

      &:hover {
        > h4 {
          color: var(--link) !important;
        }
        > span {
          color: var(--link) !important;
        }
        .tag-icon svg {
          fill: var(--link);
        }
      }
      > h4 {
        font-weight: 600;
        font-size: 17px;
      }

      > span {
        font-size: 14px;
        margin-top: 5px;
      }
    }
  }

  > .latest {
    height: 22px;
    width: 52px;
    text-align: center;
    font-size: 11px;
    padding: 2px;
    border-radius: 15px;
    border: 1px solid var(--tag);
    color: var(--tag);
    margin-left: 25px;
    -webkit-align-self: flex-start;
    -ms-flex-item-align: start;
    align-self: flex-start;
  }
`;

export const Contributors = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  grid-gap: 10px;
  align-items: center;
`;

export const ContributorsCard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  a {
    width: 32px;
    height: 32px;
  }
  img {
    border-radius: 50%;
    max-width: 32px;
  }
`;

const iconCSS = css`
  width: 16px;
  height: 16px;
  fill: var(--icon);
  flex-shrink: 0;
`;

export const TagIcon = styled(Tag)`
  width: 16px;
  height: 16px;
  fill: var(--tag);
  flex-shrink: 0;
`;

export const CheckIcon = styled(Check)`
  width: 16px;
  height: 16px;
  fill: var(--tag);
  flex-shrink: 0;
`;

export const CommitsIcon = styled(Commits)`
  ${iconCSS}
`;

export const RepoIcon = styled(Repositories)`
  ${iconCSS}
`;

export const ActionsIcon = styled(Actions)`
  ${iconCSS}
`;

export const CodeIcon = styled(Code)`
  ${iconCSS}
`;

export const IssuesIcon = styled(Issues)`
  ${iconCSS}
`;

export const ProjectsIcon = styled(Projects)`
  ${iconCSS}
`;

export const WikiIcon = styled(OverView)`
  ${iconCSS}
`;

export const InsightsIcon = styled(Insight)`
  ${iconCSS}
`;

export const PullRequestIcon = styled(PullRequest)`
  ${iconCSS}
`;

export const SecurityIcon = styled(Security)`
  ${iconCSS}
`;

export const SettingsIcon = styled(Settings)`
  ${iconCSS}
`;
export const WatchIcon = styled(Watch)`
  ${iconCSS}
`;

export const Stats = styled.ul`
  display: flex;
  align-items: center;
  > li {
    display: flex;
    align-items: center;
    margin-right: 9px;
    background-color: var(--btn);
    padding: 5px;
    border-radius: 8px;
    border: 1px solid var(--border);
    cursor: pointer;
    min-width: 130px;
    justify-content: space-evenly;
    font-size: 16px;

    > svg {
      margin-top: 3px;
    }

    > * {
      margin-right: 7px;
      color: var(--gray);
    }
  }

  @media (max-width: 810px) {
    display: none;
  }
`;

export const StarIcon = styled(RiStarLine)`
  ${iconCSS}
`;

export const ForkIcon = styled(Fork)`
  ${iconCSS}
`;

export const LinkButton = styled.a`
  text-decoration: none;

  margin-top: 24px;
  background: var(--gray-dark);
  padding: 12px 17px;
  border-radius: 24px;
  width: max-content;

  display: flex;
  align-items: center;

  > span {
    color: var(--primary);
  }
  > svg {
    fill: var(--primary);
    margin-right: 10px;
  }
`;

export const GithubIcon = styled(FaGithub)`
  ${iconCSS}
`;
