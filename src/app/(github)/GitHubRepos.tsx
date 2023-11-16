"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useRepositories from "@/hooks/useRepositories";
import { TRepository } from "@/types/repository";
import Modal from "@/components/(github)/Modal";
import { SkeletonLoading } from "@/components/loading/repositories";
import Image from "next/image";
import Repository from "@/components/(github)/Repository";
import useIssues from "@/hooks/useIssues";
import Pagination from "@/components/(github)/Pagination";
import HighLight from "@/components/(github)/Highlight";

const GitHubRepos: React.FC = () => {
  const [inputQuery, setInputQuery] = useState<string>(""); // Estado para armazenar a entrada do usuário
  const [searchQuery, setSearchQuery] = useState<string>(""); // Estado para armazenar o termo de busca
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<TRepository | null>(null);

  const {
    repositories,
    loading: loadingRepos,
    error: errorRepos,
    totalItems,
  } = useRepositories(searchQuery, currentPage, itemsPerPage);

  const {
    issues,
    loading: loadingIssues,
    error: errorIssues,
  } = useIssues(selectedRepo?.full_name);

  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const queryParam = searchParams.get("query");
    const pageParam = searchParams.get("page");

    if (queryParam) {
      setInputQuery(queryParam);
      setSearchQuery(queryParam);
      setCurrentPage(pageParam ? parseInt(pageParam, 10) : 1);
    }
  }, [searchParams]);

  // Destaques (Static)
  const [highlightUrls, setHighlightUrls] = useState([
    { name: "OpineiEstabelecimentos" },
    { name: "OpineiAvaliacoesWeb" },
    { name: "MoneyBucket" },
    { name: "IgmaChallenge" },
  ]);

  // Função para atualizar os parâmetros de pesquisa na URL.
  const updateSearchParams = (query: string, page: number) => {
    router.push(`/?query=${encodeURIComponent(query)}&page=${page}`);
  };

  // Função para lidar com a pesquisa de repositórios.
  const handleSearch = () => {
    setSearchQuery(inputQuery);
    updateSearchParams(inputQuery, 1);
  };

  // Função para abrir o modal dos repositórios
  const openModal = (repo: TRepository): void => {
    setSelectedRepo(repo);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-gray-900 p-4">
        {/* Título */}
        <div className="w-full pl-4 text-3xl font-normal text-white">
          GitHub Repositórios
        </div>

        {/* Área de busca */}
        <div className="mb-4 mt-4 flex gap-2 md:px-32">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full rounded-md px-4 py-2 text-black"
            placeholder="Buscar repositórios"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Buscar
          </button>
        </div>

        {/* Mostrar erro */}
        {errorRepos && (
          <p className="my-4 text-red-500">
            Quantidade de consultas excedidas, caso desejar continuar recarregue
            sua página!
          </p>
        )}

        {/* Resultados */}
        {repositories.length !== 0 && (
          <>
            <div className="w-full border-b-2 border-gray-300/50 text-lg font-extrabold text-white">
              Resultados
            </div>
            <div className="mt-4">
              {loadingRepos && <SkeletonLoading />}
              {!loadingRepos &&
                repositories.length > 0 &&
                repositories.map((repository) => (
                  <Repository
                    key={repository.id}
                    repository={repository}
                    openModal={() => openModal(repository)}
                  />
                ))}
            </div>
          </>
        )}

        {/* Sem resultados */}
        {repositories.length == 0 && (
          <div className="flex h-64 w-full items-center justify-center font-bold text-white">
            Não há resultados disponíveis ainda
          </div>
        )}
      </div>

      {/* Modal */}
      <div className="p-4">
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          repoDetails={selectedRepo}
          issues={issues}
        />
      </div>

      {/* Seletores de paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages} // Você precisa calcular isso com base nos dados do back-end
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Repositórios em destaque */}
      <HighLight highLights={highlightUrls} setInputQuery={setInputQuery} />
    </>
  );
};

export default GitHubRepos;
