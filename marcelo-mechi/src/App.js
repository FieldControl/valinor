import SearchBar from "./components/SearchBar";
import RepoList from "./components/RepoList";
import searchRepos from './api';
import { useState } from "react";

function App() {
    const [repos, setRepos] = useState([]);

    const handleSubmit = async (username) => {
        setRepos(await searchRepos(username));
    }

    return (
        <div className="flex flex-col items-center mt-7">
            {/* Nome do site e barra de pesquisa */}
            <header className="flex flex-col justify-center items-center bg-blue-50 pb-2">
                <h1 className="main-title mb-5 font-bold bg-red-100 text-center">GitHub Repo Searcher!</h1>
                <SearchBar onSubmit={handleSubmit} />
            </header>

            {/* Lista com os repos encontrados */}
            <RepoList repos={repos} />
        </div>
    )
}

export default App;