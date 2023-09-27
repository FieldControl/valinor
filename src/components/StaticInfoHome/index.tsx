import {
  Container,
  CardLeft,
  CardRight,
  Content,
  Description,
  Detail,
  DivGroupIcons,
  GitDetails,
  H1,
  HeaderCard,
  Section,
  Span,
  Tecnologies,
  TitleCard,
  Watchs,
} from "./styles";
import logo from "@/public/logo.svg";
import angular from "@/public/angular.svg";
import react from "@/public/react.svg";
import node from "@/public/node.svg";
import python from "@/public/python.svg";
import Image from "next/image";

import { IoEyeSharp } from "react-icons/io5";
import { PiGitForkDuotone } from "react-icons/pi";
import { AiOutlineStar } from "react-icons/ai";
import { BsChatRightText } from "react-icons/bs";

export const StaticInfoHome = () => {
  return (
    <Container>
      <Content>
        <Section className="left">
          <H1>
            <Span>Find</Span> repositories, users or <br /> anything on{" "}
            <Span>github</Span>{" "}
            <Image src={logo} alt="" width={33.08} height={32.49} />
          </H1>

          <CardLeft>
            <H1>
              1.1 M+ <br />
              <Span>Repositories</Span>
            </H1>

            <DivGroupIcons>
              <Image src={angular} alt="" />
              <Image src={react} alt="" />
              <Image src={node} alt="" />
              <Image src={python} alt="" />
            </DivGroupIcons>
          </CardLeft>
        </Section>

        <Section className="right">
          <CardRight>
            <HeaderCard>
              <TitleCard>github-readme-stats</TitleCard>
              <Watchs>
                <IoEyeSharp />
                <p>Watch 5</p>
              </Watchs>
            </HeaderCard>

            <GitDetails>
              <Detail>
                <AiOutlineStar />
                <p>125</p>
              </Detail>

              <Detail>
                <PiGitForkDuotone />
                <p>12400</p>
              </Detail>

              <Tecnologies>
                <p>Python</p>
              </Tecnologies>
            </GitDetails>

            <Description>
              <BsChatRightText />
              <p>Dynamically generated stats for your github readmes</p>
            </Description>
          </CardRight>

          <CardRight>
            <HeaderCard>
              <TitleCard>github-readme-stats</TitleCard>
              <Watchs>
                <IoEyeSharp />
                <p>Watch 5</p>
              </Watchs>
            </HeaderCard>

            <GitDetails>
              <Detail>
                <AiOutlineStar />
                <p>125</p>
              </Detail>

              <Detail>
                <PiGitForkDuotone />
                <p>12400</p>
              </Detail>

              <Tecnologies>
                <p>Python</p>
              </Tecnologies>
            </GitDetails>

            <Description>
              <BsChatRightText />
              <p>Dynamically generated stats for your github readmes</p>
            </Description>
          </CardRight>

          <CardRight>
            <HeaderCard>
              <TitleCard>github-readme-stats</TitleCard>
              <Watchs>
                <IoEyeSharp />
                <p>Watch 5</p>
              </Watchs>
            </HeaderCard>

            <GitDetails>
              <Detail>
                <AiOutlineStar />
                <p>125</p>
              </Detail>

              <Detail>
                <PiGitForkDuotone />
                <p>12400</p>
              </Detail>

              <Tecnologies>
                <p>Python</p>
              </Tecnologies>
            </GitDetails>

            <Description>
              <BsChatRightText />
              <p>Dynamically generated stats for your github readmes</p>
            </Description>
          </CardRight>
        </Section>
      </Content>
    </Container>
  );
};
