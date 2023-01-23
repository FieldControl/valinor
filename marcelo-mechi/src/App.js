import SearchBar from "./components/SearchBar";
import RepoList from "./components/RepoList";
import searchRepos from './api';
import { useEffect, useState } from "react";

function App() {
    const [repos, setRepos] = useState([]);

    const handleSubmit = async (username) => {
        setRepos(await searchRepos(username));
    }

    useEffect(() => {
        searchRepos();
    }, []);

    return (
        <div className="flex flex-col items-center">
            {/* Nome do site e barra de pesquisa */}
            <header className="flex flex-col justify-center items-center bg-blue-100 pb-2">
                <h1 className="main-title mt-7 mb-5 font-bold bg-red-100 text-center">GitHub Repo Searcher</h1>
                <SearchBar onSubmit={handleSubmit} />
            </header>

            {/* Lista com os repos encontrados */}
            <RepoList repos={repos} />
        </div>
    )
}

export default App;