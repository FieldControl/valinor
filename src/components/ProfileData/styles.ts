import styled, { css } from 'styled-components';
import { RiGroupLine } from 'react-icons/ri';
import { FaTwitter } from 'react-icons/fa';
import { Company, Email, Link, Location } from '../../styles/Icons';

export const Container = styled.div``;

export const Flex = styled.div`
  display: flex;
  align-items: center;

  > div {
    margin-left: 24px;

    > h1 {
      font-size: 26px;
      line-height: 1.25;
      color: var(--gray-dark);
      font-weight: 600;
    }
    > a {
      width: 100%;
      height: 100%;
      text-decoration: none;
      transition: filter 0.6s ease-in-out !important;
    }

    > a:hover {
      text-decoration: underline;
      color: rgb(79, 140, 201) !important;
      transition: filter 0.6s ease-in-out !important;
      filter: brightness(1.3);
    }
    > a h2 {
      font-size: 20px;
      color: var(--username);
      font-weight: 300;
    }
    > p {
      font-size: 14px;
      margin-top: 10px;
      color: var(--gray-dark);
    }
  }

  @media (min-width: 768px) {
    flex-direction: column;
    align-items: flex-start;

    > div {
      margin-left: 0;
      margin-top: 16px;
    }
  }
`;

export const Avatar = styled.img`
  width: 16%;
  border-radius: 50%;
  cursor: pointer;

  @media (min-width: 768px) {
    width: 100%;
    margin-top: -34px;
  }
`;

export const Row = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 20px 0;

  > .link-li {
    cursor: pointer;
    text-decoration: none;
    transition: filter 0.6s ease-in-out !important;
  }

  > .link-li:hover {
    text-decoration: underline;
    color: rgb(79, 140, 201) !important;
    transition: filter 0.6s ease-in-out !important;
    filter: brightness(1.3);
  }

  > li {
    display: flex;
    align-items: center;

    span {
      font-size: 14px;
      color: var(--gray);
    }
    b {
      font-size: 14px;
      color: var(--gray);
    }
    > * {
      margin-right: 5px;
    }
  }
`;

const iconCSS = css`
  width: 16px;
  height: 16px;
  fill: var(--icon);
  flex-shrink: 0;
`;

export const PeopleIcon = styled(RiGroupLine)`
  ${iconCSS}
`;

export const Column = styled.ul`
  margin-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  li {
    display: flex;
    align-items: center;
    font-size: 14px;
  }
  li + li {
    margin-top: 10px;
  }
  span {
    margin-left: 5px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    > a {
      text-decoration: none;
      transition: filter 0.6s ease-in-out !important;
    }
    > a:hover {
      text-decoration: underline;
      color: '#33A1F2' !important;
      transition: filter 0.6s ease-in-out !important;
    }
  }
`;

export const Organizations = styled.div`
  h5 {
    font-size: 18px;
    line-height: 1.25;
    color: var(--gray-dark);
    font-weight: 600;
    margin-top: 10px;
  }
  @media (max-width: 478px) {
    display: none;
  }
`;

export const OrganizationsContainer = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  grid-gap: 5px;
  align-items: center;
`;

export const OrganizationCard = styled.div`
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

export const CompanyIcon = styled(Company)`
  ${iconCSS}
`;

export const LocationIcon = styled(Location)`
  ${iconCSS}
`;

export const EmailIcon = styled(Email)`
  ${iconCSS}
`;

export const BlogIcon = styled(Link)`
  ${iconCSS}
`;
export const TwitterIcon = styled(FaTwitter)`
  ${iconCSS}
`;
