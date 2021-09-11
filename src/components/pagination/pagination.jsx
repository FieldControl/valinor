import React, { useContext } from 'react';
import { context } from '../../context/data-provider';

const Pagination = ({ pageLimit }) => {
  const value = useContext(context);
  // const [repos] = value.repos;
  const [setCurrentPage] = value.setCurrentPage;
  const [currentPage] = value.currentPage;

  const nextPage = () => {
    setCurrentPage((page) => page + 1);
  };

  const prevPage = () => {
    setCurrentPage((page) => page - 1);
  };

  function changePage(e) {
    const pageNumber = Number(e.target.textContent);
    setCurrentPage(pageNumber);
  }

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
  };

  return (
    <div>
      <button onClick={prevPage}>prev</button>
      {getPaginationGroup().map((item, index) => (
        <button key={index} onClick={changePage}>
          <span>{item}</span>
        </button>
      ))}
      <button onClick={nextPage}>next</button>
    </div>
  );
};

export default Pagination;
