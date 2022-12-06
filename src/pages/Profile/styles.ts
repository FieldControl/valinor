import styled, { css } from 'styled-components';
import { OverView, Repositories, Projects, Packages } from '../../styles/Icons';

interface ContainerProps {
  panelActive: number;
}

const iconCSS = css`
  width: 16px;
  height: 16px;
  margin-right: 4px;
  margin-top: 4px;
  fill: var(--black);
`;

export const Container = styled.div<ContainerProps>`
  --horizontalPadding: 16px;
  --verticalPadding: 24px;

  padding: var(--verticalPadding) var(--horizontalPadding);

  @media (min-width: 768px) {
    ${props => props.panelActive === 1 && `height: calc(100% - 94px);`}
    ${props => props.panelActive === 1 && `min-height: calc(100% - 94px);`}
  }
`;

export const Loader = styled.div`
  height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;

  margin: 0 auto;
  max-width: 1280px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const LeftSide = styled.div`
  padding: 0 var(--horizontalPadding);

  @media (min-width: 768px) {
    width: 25%;
  }
`;

export const RightSide = styled.div`
  padding: 0 var(--horizontalPadding);

  @media (min-width: 768px) {
    width: 75%;
  }
`;

export const Repos = styled.div`
  margin-top: var(--verticalPadding);
  position: relative;

  > .repo-link {
    position: absolute;
    font-size: 14px;
    color: var(--link);
    top: 0;
    right: 0;
  }

  > h2 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
  }
  > div {
    margin-top: 8px;

    display: grid;
    grid-gap: 16px;

    grid-template-columns: 1fr;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: minmax(min-content, max-content);
    }
  }
`;

export const CalendarHeading = styled.span`
  font-size: 16px;
  margin: 36px 0 9px;
  display: inline-flex;
`;

export const RepoIcon = styled(Repositories)`
  ${iconCSS}
`;

export const OverViewIcon = styled(OverView)`
  ${iconCSS}
`;

export const ProjectsIcon = styled(Projects)`
  ${iconCSS}
`;

export const PackagesIcon = styled(Packages)`
  ${iconCSS}
`;

export const Tab = styled.div`
  background: var(--primary);
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);

  .content {
    display: flex;
    align-items: center;
    width: min-content;
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

  &.mobile {
    margin-top: var(--verticalPadding);
    overflow-x: auto;

    ::-webkit-scrollbar-thumb {
      background: var(--gray-light);
    }
    ::-webkit-scrollbar {
      height: 5px !important;
      width: 5px !important;
    }

    .content {
      margin: 0 auto;
      cursor: pointer;
    }

    @media (min-width: 768px) {
      display: none;
    }
  }
  &.desktop {
    display: none;

    @media (min-width: 768px) {
      display: unset;

      .wrapper {
        display: flex;
        justify-content: space-between;
        margin: 0 auto;
        max-width: 1280px;
      }

      .offset {
        width: 25%;
        margin-right: var(--horizontalPadding);
      }
    }
  }
`;
