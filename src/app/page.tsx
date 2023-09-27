"use client";
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
import { BackgroundAnimated } from "../components/BackgroundAnimated";
import { StaticInfoHome } from "../components/StaticInfoHome";
import { useState } from "react";
import { GitHubRepository, GitHubSearchResult } from "../types/repositories";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const apiUrl = "https://api.github.com/search";

  const [repositories, setRepositories] = useState<GitHubRepository[] | undefined>(undefined)
  const [user, setUser] = useState<GitHubSearchResult | undefined>(undefined)


  const handleSearch = async () => {
    if (inputValue.trim() === "") {
      return;
    }

    let endpoint = "/repositories"; // Rota de repositórios padrão

    // Verifique se a entrada parece ser um nome de usuário ou um repositório
    if (inputValue.includes("/")) {
      endpoint = "/users";
    }

    try {
      const response = await fetch(`${apiUrl}${endpoint}?q=${inputValue}`);
      const responseJson = await response.json()

      if (endpoint === "/repositories") {
        // Lógica para manipular resultados de repositórios
        setRepositories(responseJson)
      } else {
        // Lógica para manipular resultados de usuários
        setUser(responseJson)
      }
    } catch (error) {
      console.error("Erro na solicitação:", error);
    }
  };


  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Image src={logo} alt="" />

          <ContentButton>
            <Input
              type="text"
              placeholder="find anything"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <BsSearch />
            </Button>
          </ContentButton>
        </HeaderContent>
      </HeaderContainer>

      <StaticInfoHome />
      <BackgroundAnimated />
    </>
  );
}
