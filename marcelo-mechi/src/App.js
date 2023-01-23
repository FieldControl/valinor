import SearchBar from "./components/SearchBar";
import RepoList from "./components/RepoList";
import searchRepos from './api';
import { useState } from "react";

function App() {
    const [repos, setRepos] = useState([]);

    const handleSubmit = async (username) => {
        setRepos(await searchRepos(username));
        console.log(repos);
    }

    return (
        <div className="mt-7">
            {/* Nome do site e barra de pesquisa */}
            <header className="flex flex-col justify-center items-center">
                <h1 className="mb-5 font-bold text-xl bg-red-100 text-center">GitHub Repo Searcher!</h1>
                <SearchBar onSubmit={handleSubmit} />
            </header>

            {/* Lista com os repos encontrados */}
            <RepoList repos={repos} />
        </div>
    )
}

export default App;