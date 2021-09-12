import React from "react";
import TagItem from "../TagItem";

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

const RepoItem: React.FC = () => {
  return (
    <Container>
      <BookMarkIcon />

      <TextContent>
        <Header>
          <Name href="#">nodejs/node</Name>
          <Description>Node.js JavaScript runtime</Description>
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
            81.7k
          </StarsContainer>
          <Language>JavaScript</Language>
          <Updated>Updated 3 hours ago</Updated>
          <Issues href="#">75 issues need help</Issues>
        </Footer>
      </TextContent>
    </Container>
  );
};

export default RepoItem;
