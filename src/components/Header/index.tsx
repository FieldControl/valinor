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
import {BsSearch} from 'react-icons/bs'

interface Props {
    toggledTheme: () => void,
}

export const Header = ({toggledTheme}: Props) => {
    const colors = useContext(ThemeContext)
    const title = useContext(ThemeContext)
    
  return (
    <HeaderContainer>
      <HeaderContent>
        <Image src={logo} alt=""/>

        <ContentButton>
          <Input type="text" placeholder="find anything"/>
          <Button><BsSearch /></Button>
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
