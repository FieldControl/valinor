import { useEffect, useState } from "react";
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
import {GrNext} from 'react-icons/gr'
import {MdArrowBackIosNew} from 'react-icons/md'


interface UserProps {
  user: GitHubSearchResult | undefined;
}

export const User = ({ user }: UserProps) => {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 6;

  useEffect(() => {
    const fetchUserRepos = async () => {
      if (user) {
        try {
          const response = await fetch(user?.items[0].repos_url);
          if (response.ok) {
            const data = await response.json();
            setRepos(data);
          } else {
            console.error("Erro ao carregar os repositórios do usuário");
          }
        } catch (error) {
          console.error("Erro ao carregar os repositórios do usuário", error);
        }
      }
    };

    fetchUserRepos();
  }, [user]);

  // Calcula o índice inicial e final dos repositórios a serem exibidos na página atual
  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (indexOfLastRepo < repos.length) {
      setCurrentPage(currentPage + 1);
    }
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
            <p className="repos">Repositories {repos.length}</p>
          </AvatarDetails>
        </Profile>
      </UserCard>

      <UserRepositories>
        {currentRepos.map((repo) => (
          <CardRight key={repo.id}>
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
            disabled={indexOfLastRepo >= repos.length}
          >
            Próximo
          </button>
            <GrNext />
        </ButtonNext>
      </Controls>
    </UserContainer>
  );
};
