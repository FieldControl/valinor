import React from "react";

// Tipagem para as props do componente Pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  // Determina o número máximo de páginas a serem exibidas na janela deslizante
  const maxPagesToShow = 5;
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPagesToShow + 1, 1);
  }

  // Cria um array para as páginas que serão exibidas
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Botão Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600
                   md:px-4 md:py-2 md:text-base"
      >
        Anterior
      </button>

      {/* Páginas à esquerda da janela deslizante */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="rounded-lg bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600
                       md:px-4 md:py-2 md:text-base"
          >
            1
          </button>
          {startPage > 2 && (
            <span className="px-2 py-1 text-sm text-white md:px-4 md:py-2 md:text-base">
              ...
            </span>
          )}
        </>
      )}

      {/* Números das páginas na janela deslizante */}
      {pages.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`rounded-lg px-2 py-1 text-sm transition-colors duration-300 md:px-4
          md:py-2 md:text-base
          ${
            currentPage === number
              ? "bg-blue-800 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {number}
        </button>
      ))}

      {/* Páginas à direita da janela deslizante */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 py-1 text-sm text-white md:px-4 md:py-2 md:text-base">
              ...
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="rounded-lg bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600
                       md:px-4 md:py-2 md:text-base"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botão Próximo */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600
                   md:px-4 md:py-2 md:text-base"
      >
        Próximo
      </button>
    </div>
  );
};

export default Pagination;
