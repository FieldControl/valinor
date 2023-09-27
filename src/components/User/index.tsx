'use client'
import { useState } from "react";
import { IoEyeSharp } from "react-icons/io5";
import { GitHubRepository, GitHubSearchResult } from "../../types/repositories";
import {
  Avatar,
  AvatarDetails,
  AvatarName,
  ButtonNext,
  ButtonPrev,
  CardRight,
  Controls,
  Description,
  Detail,
  GitDetails,
  HeaderCard,
  Profile,
  Tecnologies,
  TitleCard,
  UserCard,
  UserContainer,
  UserRepositories,
  Watchs,
} from "./styles";
import Image from "next/image";
import { AiOutlineStar } from "react-icons/ai";
import { BsChatRightText } from "react-icons/bs";
import { PiGitForkDuotone } from "react-icons/pi";
import { GrNext } from "react-icons/gr";
import { MdArrowBackIosNew } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ModalInfo } from "../Modal";

interface UserProps {
  user: GitHubSearchResult | undefined;
}

export const User = ({ user }: UserProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 6;
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(
    null
  );

  const { data: repos, isLoading } = useQuery({
    queryKey: ["user", user, currentPage],
    async queryFn({ signal }) {
      const perPage = reposPerPage;
      const page = currentPage;
      const reposUrl = user?.items[0].repos_url;

      if (!reposUrl) {
        return [];
      }

      const url = `${reposUrl}?per_page=${perPage}&page=${page}`;
      return await ky.get(url, { signal }).json<GitHubRepository[]>();
    },
    enabled: Boolean(user),
  });

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (repos && repos.length >= reposPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openModal = (selectedRepo: GitHubRepository) => {
    setSelectedRepo(selectedRepo)
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  
  return (
    <UserContainer>
      <UserCard>
        <Profile>
          <Avatar>
            <Image
              src={user?.items[0].avatar_url || ""}
              alt=""
              width={65}
              height={65}
            />
          </Avatar>
          <AvatarDetails>
            <AvatarName>{user?.items[0].login}</AvatarName>
          </AvatarDetails>
        </Profile>
      </UserCard>

      <UserRepositories>
        {repos?.map((repo) => (
          <CardRight key={repo.id} onClick={() => openModal(repo)}>
            <HeaderCard>
              <TitleCard>{repo.name}</TitleCard>
              <Watchs>
                <IoEyeSharp />
                <p>Watch {repo.watchers_count}</p>
              </Watchs>
            </HeaderCard>

            <GitDetails>
              <Detail>
                <AiOutlineStar />
                <p>{repo.stargazers_count}</p>
              </Detail>

              <Detail>
                <PiGitForkDuotone />
                <p>{repo.forks_count}</p>
              </Detail>

              <Tecnologies>
                {repo.language && <p>{repo.language}</p>}
              </Tecnologies>
            </GitDetails>

            <Description>
              <BsChatRightText />
              <p>{repo.description}</p>
            </Description>
          </CardRight>
        ))}
      </UserRepositories>

      <Controls>
        <ButtonPrev>
          <MdArrowBackIosNew />
          <button onClick={goToPrevPage} disabled={currentPage === 1}>
            Anterior
          </button>
        </ButtonPrev>
        <ButtonNext>
          <button
            onClick={goToNextPage}
            disabled={!(repos && repos.length >= reposPerPage)}
          >
            Próximo
          </button>
          <GrNext />
        </ButtonNext>
      </Controls>

      <ModalInfo isOpen={modalIsOpen} onRequestClose={closeModal} selectedRepo={selectedRepo}/>
    </UserContainer>
  );
};
