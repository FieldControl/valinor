import { useState, useEffect } from "react";
import { Card } from "../../components/card";
import { Header } from "../../components/header";
import { Repositories } from "../../model/repositories";
import * as services from "../../services/apiRequestHttp";
import { Body, Main } from "./styles";

export const HomePage: React.FC = (): JSX.Element => {

    const [repositories, setRepositories] = useState<[Repositories]>();

    const getRepositories = (data: { repositorie: string }): void => {

        const { repositorie } = data;

        services.client.get(`/repositories?q=${repositorie}`)
            .then(res => setRepositories(res.data.items))
            .catch(err => console.log(err.response.data));
    };

    useEffect(() => { }, [repositories]);
    
    return (
        <Body>
            <Header getRepositories={getRepositories} />
            <Main>
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
            </Main>
        </Body>
    );
};