"use client";
import styled from "styled-components";

export const HeaderContainer = styled.header`
  border-bottom: 1px solid ${(props) => props.theme.colors.bg300};
  backdrop-filter: blur(10px);
`;

export const HeaderContent = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  height: 4.3125rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3.75rem;
`;

export const ContentButton = styled.div`
  width: 11.875rem;
  height: 2.6rem;
  border: 1px solid ${(props) => props.theme.colors.bg300};
  border-radius: 99px;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  padding: 1rem;
  outline: none;
  color: ${(props) => props.theme.colors.text100};
`;

export const Button = styled.button`
  border: none;
  border-radius: 0 99px 99px 0;
  height: 2.6rem;
  width: 46px;
  background: ${(props) => props.theme.colors.primary100};
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
`;
