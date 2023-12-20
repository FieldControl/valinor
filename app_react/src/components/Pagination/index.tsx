interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

function Pagination({ currentPage, totalPages, setCurrentPage }: PaginationProps) {
  return (
    <div className="flex justify-between mt-4">
      <button
        className={`bg-gray-800 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      <span className="text-white">
        Página {currentPage} de {totalPages}
      </span>
      <button
        className="bg-gray-800 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Próximo
      </button>
    </div>
  );
}

export default Pagination;
