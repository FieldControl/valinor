import React from "react";
import { IRepository } from "../../config/interfaces";
import TagItem from "../TagItem";

import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";

import {
  Container,
  BookMarkIcon,
  TextContent,
  Header,
  Name,
  Description,
  TagList,
  Footer,
  StarsContainer,
  Star,
  Language,
  Updated,
  Issues,
} from "./styles";
import { NumberLiteralType } from "typescript";

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

  // const formatNumber = (number: NumberLiteralType) => {
  //   const NumberToString = number.toString();

  //   if (NumberToString.length > 3) {

  //   }
  // };

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

        <TagList>
          <TagItem />
          <TagItem />
          <TagItem />
          <TagItem />
          <TagItem />
          <TagItem />
        </TagList>

        <Footer>
          <StarsContainer>
            <Star />
            {stargazers_count}
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
