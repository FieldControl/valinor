'use client'
import {
  CardLeft,
  CardRight,
  Container,
  Description,
  Detail,
  DivGroupIcons,
  GitDetails,
  H1,
  HeaderCard,
  Section,
  Span,
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

import { useAppContext } from "../contexts/AppContext";

export default function Home() {
  const { inputValue } = useAppContext()

  return (
    <Container>
      <Section className="left">
        <H1>
          <Span>Find</Span> repositories, users or <br /> anything on{" "}
          <Span>github</Span> <Image src={logo} alt="" />
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
          </GitDetails>

          <Description>
            <BsChatRightText />
            <p>Dynamically generated stats for your github readmes</p>
          </Description>

          <Image src={python} alt="" className="tecnologies"/>
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
          </GitDetails>

          <Description>
            <BsChatRightText />
            <p>Dynamically generated stats for your github readmes</p>
          </Description>

          <Image src={python} alt="" className="tecnologies"/>
        </CardRight>
      </Section>
    </Container>
  );
}
