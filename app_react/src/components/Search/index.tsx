import { useSearch } from "../../hooks/useSearchRepo";

export default function Search() {
  const { setGetRepoName, getRepo, getRepoName } = useSearch()
  return (
    <>
      <input
        type="text"
        id="search_input"
        className="w-52 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Buscar"
        required
        onChange={(e) => setGetRepoName(e.target.value)}
      />
      <button
        className="bg-gray-800 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
        onClick={() => getRepo(getRepoName)}
      >
        Buscar
      </button>
    </>
  );
}
