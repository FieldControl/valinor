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
import { User } from "../components/User";
import { Repositories } from "../components/Repositories";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const apiUrl = "https://api.github.com/search";

  const [repositories, setRepositories] = useState<
    GitHubRepository[] | undefined
  >(undefined);
  const [user, setUser] = useState<GitHubSearchResult | undefined>(undefined);

  const [activeComponent, setActiveComponent] = useState<
    "user" | "repositories" | "home"
  >("home");

  const handleSearch = async () => {
    if (inputValue.trim() === "") {
      return;
    }
    try {
      const userResponse = await fetch(`${apiUrl}/users?q=${inputValue}`);

      if (userResponse.status === 200) {
        const userJson = await userResponse.json();
        
        if (userJson.total_count > 0) {
          setUser(userJson);
          setActiveComponent("user");
        } 

        else {
          const repoResponse = await fetch(
            `${apiUrl}/repositories?q=${inputValue}`
          )
          const repoJson = await repoResponse.json();
          setRepositories(repoJson.items);
          setActiveComponent("repositories");

          console.log(repoJson)
        }

      } else {
        const repoResponse = await fetch(
          `${apiUrl}/repositories?q=${inputValue}`
        );
        const repoJson = await repoResponse.json();
        setRepositories(repoJson);
        setActiveComponent("repositories");
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

      {activeComponent === "home" && <StaticInfoHome />}
      {activeComponent === "user" && <User user={user} />}
      {activeComponent === "repositories" && <Repositories repos={repositories} />}
      <BackgroundAnimated />
    </>
  );
}
