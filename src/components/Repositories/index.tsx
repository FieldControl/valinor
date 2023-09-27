import { IoEyeSharp } from "react-icons/io5";
import { Card, Description, Detail, GitDetails, HeaderCard, RepoContainer, TitleCard, Watchs } from "./styles";
import { AiOutlineStar } from "react-icons/ai";
import { PiGitForkDuotone } from "react-icons/pi";
import { BsChatRightText } from "react-icons/bs";
import Image from "next/image";

export const Repositories = () => {
  return (
    <RepoContainer>
      <Card>
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

        <Image src={''} alt="" className="tecnologies" />
      </Card>
    </RepoContainer>
  );
};
