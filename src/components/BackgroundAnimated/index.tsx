import {
    DiRuby,
    DiAngularSimple,
    DiReact,
    DiPython,
    DiNodejsSmall,
    DiGithubBadge,
    DiJava,
    DiCss3,
    DiJavascript,
  } from "react-icons/di";
  import { SiMui } from "react-icons/si";
import { Circles, Li } from "./styles";

export const BackgroundAnimated = () => {
    return(
        <Circles>
          <Li>
            <DiRuby />
          </Li>
          <Li>
            <DiAngularSimple />
          </Li>
          <Li>
            <SiMui />
          </Li>
          <Li>
            <DiPython />
          </Li>
          <Li>
            <DiNodejsSmall />
          </Li>
          <Li>
            <DiGithubBadge />
          </Li>
          <Li>
            <DiJava />
          </Li>
          <Li>
            <DiCss3 />
          </Li>
          <Li>
            <DiJavascript />
          </Li>
          <Li>
            <DiReact />
          </Li>
        </Circles>
    )
}