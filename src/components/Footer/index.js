import React from "react";
import GitHub from "../../assets/github.png";
import In from "../../assets/in.png";

import {
    FooterContainer,
    TextTopicFooter,
    LinkSocialMedias,
} from './styles'

export default function Footer () {

    return(
        <FooterContainer>
            <TextTopicFooter>
                © - Gabriel Silva dos Santos
            </TextTopicFooter>
            
            <TextTopicFooter>
                <LinkSocialMedias target="_blank" href="https://github.com/Sorriso337">
                    <img src={GitHub} />
                </LinkSocialMedias>
                <LinkSocialMedias target="_blank" href="https://www.linkedin.com/in/gabriel-silva-8a7461198">
                    <img src={In} />
                </LinkSocialMedias>
            </TextTopicFooter>
        </FooterContainer>

    )
}
