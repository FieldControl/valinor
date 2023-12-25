import Header from "../../components/Header";
import RepoCard from "../../components/RepoCard";
import Pagination from "../../components/Pagination";
import { useSearch } from "../../hooks/useSearchRepo";
import {
  PaginationData,
  paginateData,
  calculateTotalPages,
  reposPerPage,
} from "../../utils/paginationUtils";

export default function Home() {
  const {
    repos,
    currentPage: searchCurrentPage,
    setCurrentPage,
    loading,
  } = useSearch();

  const { currentPage, data: currentRepos }: PaginationData<(typeof repos)[0]> =
    paginateData(repos, searchCurrentPage, reposPerPage);
  const totalPages = calculateTotalPages(repos.length, reposPerPage);
  return (
    <>
      <Header />
      <div className="p-4 flex align-middle">
        <main className="w-full">
          {loading ? (
            // Spinner do Tailwind enquanto os dados estão sendo carregados
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-300"></div>
            </div>
          ) : (
            // Renderizar os dados
            <>
              {currentRepos.length === 0 ? (
                <p className="text-white text-3xl h-[100vh] items-center flex justify-center">
                  Nenhum repositório encontrado.
                </p>
              ) : (
                currentRepos.map((item) => (
                  <RepoCard
                    key={item.full_name}
                    owner={item.owner}
                    full_name={item.full_name}
                    language={item.language}
                    updated_at={item.updated_at}
                    watchers_count={item.watchers_count}
                    description={item.description}
                    topics={item.topics}
                    html_url={item.html_url}
                  />
                ))
              )}
              {currentRepos.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
