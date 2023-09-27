"use client";
import {
  Box,
  Button,
  ContentButton,
  DarkIcon,
  HeaderContainer,
  HeaderContent,
  Input,
  LightIcon,
} from "./styles";
import logo from "@/public/logo.svg";
import Image from "next/image";
import { useContext } from "react";
import Switch from "react-switch";
import { ThemeContext } from "styled-components";
import { BsSearch } from "react-icons/bs";

import { useAppContext } from "../../contexts/AppContext";

interface Props {
  toggledTheme: () => void;
}

export const Header = ({ toggledTheme }: Props) => {
  const colors = useContext(ThemeContext);
  const title = useContext(ThemeContext);

  const { inputValue, setInputValue } = useAppContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Image src={logo} alt="" />

        <ContentButton>
          <Input
            type="text"
            placeholder="find anything"
            value={inputValue}
            onChange={handleInputChange}
          />
          <Button>
            <BsSearch />
          </Button>
        </ContentButton>

        <Switch
          onChange={toggledTheme}
          checked={title?.title === "light"}
          height={30}
          width={70}
          offColor={colors?.colors.toggle}
          onColor={colors?.colors.toggle}
          className="switch"
          checkedIcon={false}
          uncheckedIcon={false}
          checkedHandleIcon={
            <Box>
              <LightIcon />
            </Box>
          }
          uncheckedHandleIcon={
            <Box>
              <DarkIcon />
            </Box>
          }
          handleDiameter={30}
        />
      </HeaderContent>
    </HeaderContainer>
  );
};
