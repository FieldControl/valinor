"use client";
import styled from "styled-components";
import { BsFillSunFill } from "react-icons/bs";
import { MdNightlight } from "react-icons/md";

export const HeaderContainer = styled.header`
  border-bottom: 1px solid ${props => props.theme.colors.bg300};
`;

export const HeaderContent = styled.div`
  width: 100%;
  max-width: 1364px;
  margin: 0 auto;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;

  .switch {
    border: 1px solid ${(props) => props.theme.colors.bg300};
  }
`;

export const Box = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const LightIcon = styled(BsFillSunFill)`
    font-size: 20px;
    color: #707070;
`;

export const DarkIcon = styled(MdNightlight)`
    font-size: 20px;
    color: #707070;

`;
export const ContentButton = styled.div`
  width: 260px;
  height: 42px;
  border: 1px solid ${props => props.theme.colors.bg300};
  border-radius: 99px;
  display: flex;
  align-items: center;
`
export const Input = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  padding: 1rem;
  outline: none;
  color: ${props => props.theme.colors.text100};
`

export const Button = styled.button`
  border: none;
  border-radius: 0 99px 99px 0;
  height: 42px;
  width: 65px;
  background: ${props => props.theme.colors.primary100};
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
`
