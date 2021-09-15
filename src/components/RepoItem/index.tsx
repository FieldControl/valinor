import React from "react";
import { IRepository } from "../../config/interfaces";

import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";

import {
  Container,
  BookMarkIcon,
  TextContent,
  Header,
  Name,
  Description,
  Footer,
  StarsContainer,
  Star,
  Language,
  Updated,
  Issues,
} from "./styles";
import { abbreviateNumber } from "../../utils/format";

dayjs.extend(relativeTimePlugin);

interface IRepoItem {
  repository: IRepository;
}

const RepoItem: React.FC<IRepoItem> = ({ repository }) => {
  const {
    name,
    html_url,
    language,
    updated_at,
    description,
    stargazers_count,
    open_issues_count,
    owner: { login },
  } = repository;

  return (
    <Container>
      <BookMarkIcon />

      <TextContent>
        <Header>
          <Name href={html_url}>
            {login}/<strong>{name}</strong>
          </Name>
          <Description>{description}</Description>
        </Header>

        <Footer>
          <StarsContainer>
            <Star />
            {abbreviateNumber(stargazers_count)}
          </StarsContainer>
          <Language>{language}</Language>
          <Updated>Updated {dayjs(updated_at).fromNow()}</Updated>
          <Issues href={`${html_url}/issues`}>
            {open_issues_count} issues need help
          </Issues>
        </Footer>
      </TextContent>
    </Container>
  );
};

export default RepoItem;
