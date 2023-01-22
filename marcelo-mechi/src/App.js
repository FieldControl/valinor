import SearchBar from "./components/SearchBar";
import searchRepos from './api';

function App() {
    const handleSubmit = (word) => {
        console.log(word);
    }

    return (
        <div className="mt-7">
            <h1 className="mb-5 font-bold text-xl bg-red-100 text-center">GitHub Repo Searcher!</h1>
            <SearchBar onSubmit={handleSubmit} />
        </div>
    )
}

export default App;