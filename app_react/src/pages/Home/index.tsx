import Header from "../../components/Header";
import RepoCard from "../../components/RepoCard";
import Pagination from "../../components/Pagination";
import { useSearch } from "../../hooks/useSearchRepo";
import { PaginationData, paginateData, calculateTotalPages } from "../../utils/paginationUtils";

export default function Home() {
  const { repos, currentPage: searchCurrentPage, setCurrentPage } = useSearch();
  const reposPerPage = 6;

  const { currentPage, data: currentRepos }: PaginationData<typeof repos[0]> = paginateData(
    repos,
    searchCurrentPage,
    reposPerPage
  );
  const totalPages = calculateTotalPages(repos.length, reposPerPage);
  return (
    <>
      <Header />
      <div className="p-4 flex align-middle">
        <main className="w-full">
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
        </main>
      </div>
    </>
  );
}
