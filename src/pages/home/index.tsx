import { useState } from "react";
import { Card } from "../../components/card";
import { Header } from "../../components/header";
import { Pagination } from "../../components/pagination";
import { Data } from "../../model/repositories";
import * as services from "../../services/apiRequestHttp";
import { scrollTop } from "../../utils/scrollTop";
import { Container, Footer, Main } from "./styles";

export const HomePage: React.FC = (): JSX.Element => {

    const [repositories, setRepositories] = useState<Data>();
    const [offset, setOffset] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const perPage: number = 10;

    localStorage.setItem("repositories", JSON.stringify(repositories));

    const getRepositories = (data: { repositorie: string }): void => {

        const repositorie = data.repositorie || "LucianoRib5/LucianoRib5";

        const url: string = `/repositories?q=${repositorie}&per_page=${perPage}&page=${currentPage}`;

        const headers = {
            headers: {
                "Authorization": process.env.REACT_APP_TOKEN as string
            }
        };

        services.client.get(url, headers)
            .then(res => {
                localStorage.setItem("repositories", JSON.stringify(res.data));
                setRepositories(res.data);
                scrollTop();
            })
            .catch(err => console.log(err.response.data));
    };

    return (
        <Container>
            <Header getRepositories={getRepositories} offset={offset} />
            <Main>
                {repositories?.items?.map(
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
            <Footer>
                {repositories &&
                    <Pagination
                        perPage={perPage}
                        totalOfItems={repositories?.total_count}
                        offset={offset}
                        setOffset={setOffset}
                        setCurrentPage={setCurrentPage}
                    />
                }
            </Footer>
        </Container>
    );
};