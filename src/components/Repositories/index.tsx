import { IoEyeSharp } from "react-icons/io5";
import { GitHubRepository } from "../../types/repositories";
import {
  ButtonNext,
  ButtonPrev,
  CardRight,
  Controls,
  Description,
  Detail,
  GitDetails,
  HeaderCard,
  RepositoriesContainer,
  Tecnologies,
  TitleCard,
  Watchs,
} from "./styles";
import { AiOutlineStar } from "react-icons/ai";
import { PiGitForkDuotone } from "react-icons/pi";
import { BsChatRightText } from "react-icons/bs";
import { MdArrowBackIosNew } from "react-icons/md";
import { GrNext } from "react-icons/gr";
import { useState } from "react";

interface ReposProps {
  repos: GitHubRepository[] | undefined;
}

export const Repositories = ({ repos }: ReposProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 6;

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos?.slice(indexOfFirstRepo, indexOfLastRepo);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (indexOfLastRepo < (repos?.length ?? 0)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <RepositoriesContainer>
      {currentRepos?.map((repo) => (
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

            <Tecnologies>{repo.language && <p>{repo.language}</p>}</Tecnologies>
          </GitDetails>

          <Description>
            <p>{repo.description}</p>
          </Description>
        </CardRight>
      ))}

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
            disabled={indexOfLastRepo >= (repos?.length ?? 0)}
          >
            Próximo
          </button>
          <GrNext />
        </ButtonNext>
      </Controls>
    </RepositoriesContainer>
  );
};
