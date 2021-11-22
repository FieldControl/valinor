import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

import styles from "./styles.module.scss";

interface PaginationProps {
  count: number;
  currentPage: number;
  lastPage: number;
  nextPage: ({ number, next }) => void;
  previousPage: ({ number, next }) => void;
  isFetching: boolean;
}

function nextNumbers(
  currentPage: number,
  lastPage: number,
  lenght = 4
): number[] | null {
  let numbers = [];
  for (let index = currentPage + 1; index <= currentPage + lenght; index++) {
    if (index >= lastPage) return;
    numbers.push(index);
  }

  return numbers;
}
function previousNumbers(currentPage: number, lenght = 4): number[] {
  let numbers = [];

  if (!(currentPage === 1)) {
    for (let index = currentPage - 1; index >= currentPage - lenght; index--) {
      numbers[index - 1] = index;
    }
  }

  return numbers;
}

export function Pagination({
  count,
  currentPage,
  lastPage,
  nextPage,
  previousPage,
  isFetching,
}: PaginationProps) {
  return (
    <div className={styles.paginationContainer}>
      {!(currentPage <= 1) && (
        <>
          <button
            onClick={() => previousPage({ number: undefined, next: true })}
            disabled={isFetching}
            type="button"
          >
            <BsChevronLeft />
            Voltar
          </button>
          {previousNumbers(currentPage).map((num) => (
            <button
              disabled={isFetching}
              onClick={() => previousPage({ number: num, next: false })}
              key={num}
              type="button"
            >
              {num}
            </button>
          ))}
        </>
      )}
      <button className={styles.active} type="button">
        {currentPage}
      </button>
      {currentPage < lastPage &&
        nextNumbers(currentPage, lastPage)?.map((number) => (
          <button
            disabled={isFetching}
            onClick={() => nextPage({ number: number, next: false })}
            key={number}
            type="button"
          >
            {number}
          </button>
        ))}
      {currentPage < lastPage && (
        <>
          ...
          <button
            disabled={isFetching}
            onClick={() => nextPage({ number: lastPage, next: false })}
            type="button"
          >
            {lastPage}
          </button>
        </>
      )}

      {currentPage < lastPage && (
        <button
          onClick={() => nextPage({ number: undefined, next: true })}
          disabled={isFetching}
          type="button"
        >
          Próximo
          <BsChevronRight />
        </button>
      )}
    </div>
  );
}
