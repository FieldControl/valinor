import styled, { css } from "styled-components";
import { RiBookMarkLine, RiStarLine } from "react-icons/ri";

const iconCss = css`
  width: 16px;
  height: 16px;
  fill: #6a737d;
  flex-shrink: 0;
`;

export const Star = styled(RiStarLine)`
  ${iconCss}
`;

export const BookMarkIcon = styled(RiBookMarkLine)`
  ${iconCss}
  height: 24px;
`;

export const Container = styled.div`
  border-top: 1px solid #30363d;
  display: flex;
  padding: 24px 0;
`;

export const TextContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  margin-left: 8px;
`;

export const Header = styled.div``;

export const Name = styled.a`
  text-decoration: none;
  color: #58a6ff;
  line-height: 24px;

  &:hover {
    text-decoration: underline;
  }
`;

export const Description = styled.p`
  color: #c9d1d9;
  margin-bottom: 4px;
  line-height: 21px;
`;

export const TagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

export const StarsContainer = styled.button`
  color: #8b949e;
  border: none;
  cursor: pointer;
  font-size: 12px;
  background-color: transparent;
  margin-right: 16px;
  display: flex;
  align-items: center;

  ${Star} {
    margin-right: 4px;
  }

  &:hover {
    color: #58a6ff;

    ${Star} {
      fill: #58a6ff;
    }
  }
`;

export const Language = styled.p`
  color: #8b949e;
  font-size: 12px;
  margin-right: 16px;
`;

export const Updated = styled.p`
  color: #8b949e;
  font-size: 12px;
  margin-right: 16px;
`;

export const Issues = styled.a`
  color: #8b949e;
  text-decoration: none;
  font-size: 12px;

  &:hover {
    color: #58a6ff;
  }
`;
