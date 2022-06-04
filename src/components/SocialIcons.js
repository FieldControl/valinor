import { FaLinkedin, FaYoutube, FaGithub } from 'react-icons/fa';
import { StyledSocialIcons } from './styles/SocialIcons.styled';

export default function SocialIcons() {
    return (
        <StyledSocialIcons>
        <li>
            <a href="https://linkedin.com">
                <FaLinkedin/>    
            </a>
        </li>
        <li>
            <a href="https://github.com/youtube">
                <FaYoutube/>    
            </a>
        </li>
        <li>
            <a href="https://youtube.com">
                <FaGithub/>    
            </a>
        </li>
        </StyledSocialIcons> 
    )
}