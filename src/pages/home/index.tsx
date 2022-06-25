import { useState, useEffect } from "react";
import { Repositories } from "../../model/repositories";
import * as services from "../../services/apiRequestHttp";

export const HomePage: React.FC = () => {

    const [repositories, setRepositories] = useState<[Repositories]>();

    const repositorie: string = "node";

    const getRepositories = (): void => {
        services.client.get(`/repositories?q=${repositorie}`)
            .then(res => setRepositories(res.data))
            .catch(err => console.log(err.response.data));
    };

    useEffect(() => {
        getRepositories();
    }, []);

    console.log(repositories);
    return (
        <div>
            <h1> Deus seja louvado! </h1>
        </div>
    );
};