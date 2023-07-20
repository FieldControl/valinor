import React, { useState, useEffect, useCallback } from 'react';
import ReactPaginate from 'react-paginate';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (selectedItem: { selected: number }) => void;
};

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  // Função para calcular as páginas visíveis com base na página atual
  const calculateVisiblePages = useCallback(() => {
    const totalPagesToShow = 5; // Número total de páginas exibidas
    const halfTotalPagesToShow = Math.floor(totalPagesToShow / 2);

    let startPage = currentPage - halfTotalPagesToShow;
    let endPage = currentPage + halfTotalPagesToShow;

    // Verifica se a página inicial é menor ou igual a 0
    // Se for, ajusta a página final e inicia a partir da página 1
    if (startPage <= 0) {
      endPage += Math.abs(startPage) + 1;
      startPage = 1;
    }

    // Verifica se a página final é maior que o número total de páginas
    // Se for, ajusta a página inicial e termina na última página
    if (endPage > totalPages) {
      startPage -= endPage - totalPages;
      endPage = totalPages;
    }

    // Cria um array de páginas visíveis
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    setVisiblePages(pages);
  }, [currentPage, totalPages]);

  // Chama a função para calcular as páginas visíveis quando as dependências mudam
  useEffect(() => {
    calculateVisiblePages();
  }, [calculateVisiblePages]);

  return (
    <div id="Pagination">
      <ReactPaginate
        initialPage={currentPage - 1} // Página inicial selecionada (começa a partir de 0)
        pageCount={totalPages}
        pageRangeDisplayed={5} // Número de páginas exibidas no intervalo
        marginPagesDisplayed={2} // Número de páginas exibidas nas margens
        onPageChange={onPageChange} // Função de callback chamada quando a página é alterada
        previousLabel={'<'}
        nextLabel={'>'}
        breakLabel={'...'}
        containerClassName={'pagination'} // Classe CSS do contêiner da paginação
        activeClassName={'active'} // Classe CSS do contêiner da paginação
      />
    </div>
  );
};

export default Pagination;