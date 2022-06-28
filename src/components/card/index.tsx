import { Container, Info, Topics } from "./styles";
import { Props } from "../../model/card";

export const Card: React.FC<Props> = ({
    url,
    description,
    topics,
    stargazers,
    language,
    pushedAt
}): JSX.Element => {
    return (
        <Container>
            <a href={url}><h3>{url.replace("https://github.com/", "")}</h3></a>
            <p>{description}</p>
            <Topics>
                {topics?.map(topic => (
                    <a key={topic} href={`https://github.com/topics/${topic}`}>
                        <button>{topic}</button>
                    </a>
                ))}
            </Topics>
            <Info>
                <p>{stargazers}</p>
                <p>{language}</p>
                <p>{pushedAt}</p>
            </Info>
        </Container>
    );
};