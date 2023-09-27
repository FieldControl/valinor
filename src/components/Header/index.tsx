import {
  Button,
  ContentButton,
  HeaderContainer,
  HeaderContent,
  Input,
} from "./styles";
import logo from "@/public/logo.svg";
import Image from "next/image";
import { BsSearch } from "react-icons/bs";

import { useAppContext } from "../../contexts/AppContext";

export const Header = () => {
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
      </HeaderContent>
    </HeaderContainer>
  );
};
