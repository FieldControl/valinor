import styled, { css } from 'styled-components';
import { RiStarLine } from 'react-icons/ri';
import { Repositories, Fork } from '../../styles/Icons';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
`;

export const Topside = styled.div`
  > header {
    display: flex;
    align-items: center;

    > a {
      margin-left: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--link);

      text-decoration: none;

      &:focus,
      &:hover {
        text-decoration: underline;
      }
    }
  }

  > p {
    margin: 8px 0 16px;
    font-size: 12px;
    color: var(--gray);
    letter-spacing: 0.1px;
    line-height: 20px;
    > a {
      text-decoration: none;
    }
  }
`;

const iconCSS = css`
  width: 16px;
  height: 16px;
  fill: var(--icon);
  flex-shrink: 0;
`;

export const RepoIcon = styled(Repositories)`
  ${iconCSS}
`;

export const Botside = styled.div`
  > ul {
    display: flex;
    align-items: center;

    > li {
      display: flex;
      align-items: center;
      margin-right: 16px;

      > span {
        margin-left: 5px;
        font-size: 12px;
        color: var(--gray);
      }
    }
  }
`;

export const LanguageDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${props => (props.color ? props.color : '#8257e5')};
`;

export const StarIcon = styled(RiStarLine)`
  ${iconCSS}
`;

export const ForkIcon = styled(Fork)`
  ${iconCSS}
`;
