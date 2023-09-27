"use client";
import {
  Button,
  ContentButton,
  HeaderContainer,
  HeaderContent,
  Input,
  Logo,
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
import { useQuery } from "@tanstack/react-query";
import { githubApi } from "../services/github";

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  const [repositories, setRepositories] = useState<
    GitHubRepository[] | undefined
  >(undefined);
  const [user, setUser] = useState<GitHubSearchResult | undefined>(undefined);

  const [activeComponent, setActiveComponent] = useState<
    "user" | "repositories" | "home"
  >("home");

  const query = useQuery({
    queryKey: ["github", inputValue],
    async queryFn({ signal }) {
      if (inputValue.trim() === "") {
        return;
      }

      const userResponse = await githubApi.get("users", {
        signal,
        searchParams: {
          q: inputValue,
        },
      });

      if (userResponse.status === 200) {
        const userJson = await userResponse.json<GitHubSearchResult>();

        if (userJson.total_count > 0) {
          setUser(userJson);
          setActiveComponent("user");
        } else {
          const repoResponse = await githubApi.get("repositories", {
            signal,
            searchParams: {
              q: inputValue,
            },
          });
          const repoJson = await repoResponse.json<any>();
          setRepositories(repoJson.items);
          setActiveComponent("repositories");

          console.log(repoJson);
        }
      } else {
        const repoResponse = await githubApi.get("repositories", {
          signal,
          searchParams: {
            q: inputValue,
          },
        });
        const repoJson = await repoResponse.json<GitHubRepository[]>();
        setRepositories(repoJson);
        setActiveComponent("repositories");
      }
    },
    enabled: false,
  });

  const handleSearch = async () => {
    try {
      await query.refetch();
    } catch (error) {
      console.error("Erro na solicitação:", error);
    }
  };

  const Backhome = () => {
    setActiveComponent('home')
    setInputValue('')
  }

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo onClick={Backhome}>
            <Image src={logo} alt="" />
          </Logo>

          <ContentButton>
            <Input
              type="text"
              placeholder="find anything"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button disabled={query.isFetching} onClick={handleSearch}>
              <BsSearch />
            </Button>
          </ContentButton>
        </HeaderContent>
      </HeaderContainer>

      {activeComponent === "home" && <StaticInfoHome />}
      {activeComponent === "user" && <User user={user} />}
      {activeComponent === "repositories" && (
        <Repositories repos={repositories} />
      )}
      <BackgroundAnimated />
    </>
  );
}
