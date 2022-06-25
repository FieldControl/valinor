import { useState, useEffect } from "react";
import { Card } from "../../components/card";
import { Repositories } from "../../model/repositories";
import * as services from "../../services/apiRequestHttp";
import { Container } from "./styles";

export const HomePage: React.FC = (): JSX.Element => {

    const [repositories, setRepositories] = useState<[Repositories]>();

    const repositorie: string = "node";

    const getRepositories = (): void => {
        services.client.get(`/repositories?q=${repositorie}`)
            .then(res => setRepositories(res.data.items))
            .catch(err => console.log(err.response.data));
    };

    useEffect(() => {
        getRepositories();
    }, []);

    console.log(repositories);
    return (
        <Container>
            <h1> Deus seja louvado! </h1>
            {repositories?.map(
                repo =>
                    <Card
                        key={repo.id}
                        url={repo.html_url}
                        description={repo.description}
                        topics={repo.topics}
                        stargazers={repo.stargazers_count}
                        language={repo.language}
                        pushedAt={repo.pushed_at}
                    />
            )}
        </Container>
    );
};