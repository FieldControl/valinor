import { memo, useMemo } from 'react';
import {
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
} from 'react-icons/ai';

import './styles.scss';

interface PaginationProps {
  currentPage: number;
  handlePagination: (page: number) => void;
  itemsPerPage: number;
  totalCount: number;
}

function PaginationComponent({
  currentPage,
  handlePagination,
  itemsPerPage,
  totalCount,
}: PaginationProps): JSX.Element {
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / itemsPerPage);
  }, [itemsPerPage, totalCount]);

  const FIRST_PAGE = 1;
  const LAST_PAGE = totalPages;

  const pages = useMemo(() => {
    const value = Array.from(new Array(totalPages), (_, k) => k + 1);

    if (currentPage < 3) {
      return value.slice(0, 5);
    }

    if (totalPages - currentPage < 3) {
      return value.slice(-5);
    }

    return value.slice(currentPage - 3, currentPage + 2);
  }, [currentPage, totalPages]);

  const showFirst = useMemo(() => {
    return currentPage > 3;
  }, [currentPage]);

  const showNext = useMemo(() => {
    return totalPages - currentPage > 0;
  }, [currentPage, totalPages]);

  const showLast = useMemo(() => {
    return totalPages - currentPage > 2;
  }, [currentPage, totalPages]);

  const showPages = useMemo(() => {
    return totalPages !== 1;
  }, [totalPages]);

  const showPrevious = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  return (
    <div className="pagination">
      <button
        type="button"
        className={`arrow ${!showFirst && 'hidden'}`}
        onClick={() => handlePagination(FIRST_PAGE)}
      >
        <AiOutlineDoubleLeft size={24} color="#e6770b" />
      </button>
      <button
        type="button"
        className={`arrow ${!showPrevious && 'hidden'}`}
        onClick={() => handlePagination(currentPage - 1)}
      >
        <AiOutlineLeft size={24} color="#e6770b" />
      </button>
      {showPages
        ? pages.map(page => (
            <button
              key={page}
              type="button"
              className={`page-number ${page === currentPage && 'active'}`}
              onClick={() => handlePagination(page)}
            >
              {page}
            </button>
          ))
        : null}
      <button
        type="button"
        className={`arrow ${!showNext && 'hidden'}`}
        onClick={() => handlePagination(currentPage + 1)}
      >
        <AiOutlineRight size={24} color="#e6770b" />
      </button>
      <button
        type="button"
        className={`arrow ${!showLast && 'hidden'}`}
        onClick={() => handlePagination(LAST_PAGE)}
      >
        <AiOutlineDoubleRight size={24} color="#e6770b" />
      </button>
    </div>
  );
}

export const Pagination = memo(PaginationComponent);
