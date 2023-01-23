import SearchBar from "./components/SearchBar";
import RepoList from "./components/RepoList";
import searchRepos from './api';
import Pagination from "./components/Pagination";
import { useState } from "react";

function App() {
    const [repos, setRepos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [reposPerPage] = useState(8);

    const handleSubmit = async (username) => {
        setRepos(await searchRepos(username));
    }

    // Mudando de Página
    const indexOfLastRepo = currentPage * reposPerPage;
    const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
    const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="flex flex-col items-center mb-7">
            {/* Nome do site e barra de pesquisa */}
            <header className="flex flex-col justify-center items-center bg-blue-100 pb-2 w-full shadow">
                <h1 className="main-title mb-5 font-bold text-center pt-5">GitHub Repo Searcher</h1>
                <SearchBar onSubmit={handleSubmit} />
            </header>

            {/* Lista com os repos encontrados */}
            <RepoList repos={currentRepos} />

            {/* Paginação */}
            <Pagination reposPerPage={reposPerPage} totalRepos={repos.length} paginate={paginate} />
        </div>
    )
}

export default App;