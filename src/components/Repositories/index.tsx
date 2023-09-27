import { IoEyeSharp } from "react-icons/io5";
import { GitHubRepository } from "../../types/repositories";
import {
  CardRight,
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

interface ReposProps {
  repos: GitHubRepository[] | undefined;
}

export const Repositories = ({repos }: ReposProps) => {
  return (
    <RepositoriesContainer>
      {repos?.map((repo) => (
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
            <BsChatRightText />
            <p>{repo.description}</p>
          </Description>
        </CardRight>
      ))}
    </RepositoriesContainer>
  );
};
