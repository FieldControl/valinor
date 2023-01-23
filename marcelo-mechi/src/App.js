import SearchBar from "./components/SearchBar";
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
            <h1 className="mb-5 font-bold text-xl bg-red-100 text-center">GitHub Repo Searcher!</h1>
            <SearchBar onSubmit={handleSubmit} />
        </div>
    )
}

export default App;