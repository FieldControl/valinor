import React, { useContext, useEffect } from 'react';
import { context } from '../../context/data-provider';
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from 'react-icons/md';
import {
  PaginationContainer,
  PaginationButton,
  PaginationNumbers,
} from './styles';
import { useParams } from 'react-router';

const Pagination = () => {
  const value = useContext(context);
  const [setCurrentPage] = value.setCurrentPage;
  const [currentPage] = value.currentPage;
  const [totalPages] = value.totalPages;
  const [setTotalPages] = value.setTotalPages;
  const { repoName } = useParams();

  useEffect(() => {
    setTotalPages(1);
  }, [repoName, setCurrentPage, setTotalPages]);

  const nextPage = () => {
    setCurrentPage((page) => page + 1);
    window.scrollTo({ behavior: 'smooth', top: '0' });
  };

  const prevPage = () => {
    setCurrentPage((page) => page - 1);
    window.scrollTo({ behavior: 'smooth', top: '0' });
  };

  function changePage(e) {
    const pageNumber = Number(e.target.textContent);
    window.scrollTo({ behavior: 'smooth', top: '0' });
    setCurrentPage(pageNumber);
  }

  //quantidade dos números de página
  //função calcula o index que será usado para mostrar os números da próxima página.
  let pageLimit = totalPages < 5 ? totalPages : 5;
  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
  };

  return (
    <PaginationContainer>
      <PaginationButton
        onClick={prevPage}
        firstPage={currentPage === 1 ? true : false}
      >
        <MdKeyboardArrowLeft className="prev-icon" /> Previous
      </PaginationButton>
      {getPaginationGroup().map((page, index) => (
        <PaginationNumbers
          key={index}
          onClick={changePage}
          active={currentPage === page ? true : false}
          maxPages={page <= totalPages ? false : true}
        >
          <span>{page}</span>
        </PaginationNumbers>
      ))}
      <PaginationButton
        onClick={nextPage}
        lastPage={currentPage === totalPages ? true : false}
      >
        Next <MdKeyboardArrowRight className="next-icon" />
      </PaginationButton>
    </PaginationContainer>
  );
};

export default Pagination;
