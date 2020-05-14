/* eslint-disable no-plusplus */
import React, { useEffect, useState, useCallback } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import PropTypes from 'prop-types';

function CustomPagination({ limitPage, handleClick, currentPage }) {
  const [pagination, setPagination] = useState([]);

  const handlePagination = useCallback(
    page => {
      handleClick(page);
    },
    [handleClick]
  );

  useEffect(() => {
    const mountPagination = [];
    const count = limitPage > 5 ? 5 : limitPage;

    if (currentPage < 5) {
      for (let index = 1; index <= count; index++) {
        mountPagination.push(
          <PaginationItem
            active={currentPage === index}
            onClick={() => handlePagination(index)}
            key={index}
          >
            <PaginationLink>{index}</PaginationLink>
          </PaginationItem>
        );
      }

      if (limitPage > 5) {
        mountPagination.push(
          <PaginationItem disabled key="...">
            <PaginationLink>...</PaginationLink>
          </PaginationItem>,

          <PaginationItem
            onClick={() => handlePagination(limitPage)}
            key={limitPage}
          >
            <PaginationLink>{limitPage}</PaginationLink>
          </PaginationItem>
        );
      }
    } else if (currentPage >= 5) {
      mountPagination.push(
        <PaginationItem key="1" onClick={() => handlePagination(1)}>
          <PaginationLink>1</PaginationLink>
        </PaginationItem>,

        <PaginationItem key="1..." disabled>
          <PaginationLink>...</PaginationLink>
        </PaginationItem>
      );

      mountPagination.push(
        <PaginationItem
          key={currentPage - 1}
          onClick={() => handlePagination(currentPage - 1)}
        >
          <PaginationLink>{currentPage - 1}</PaginationLink>
        </PaginationItem>,

        <PaginationItem
          key={currentPage}
          active
          onClick={() => handlePagination(currentPage)}
        >
          <PaginationLink>{currentPage}</PaginationLink>
        </PaginationItem>,

        currentPage < limitPage ? (
          <PaginationItem
            key={currentPage + 1}
            onClick={() => handlePagination(currentPage + 1)}
          >
            <PaginationLink>{currentPage + 1}</PaginationLink>
          </PaginationItem>
        ) : (
          false
        )
      );

      mountPagination.push(
        currentPage + 1 < limitPage - 1 ? (
          <PaginationItem key="..." disabled>
            <PaginationLink>...</PaginationLink>
          </PaginationItem>
        ) : (
          false
        ),

        currentPage + 1 <= limitPage - 1 ? (
          <PaginationItem
            key={limitPage}
            onClick={() => handlePagination(limitPage)}
          >
            <PaginationLink>{limitPage}</PaginationLink>
          </PaginationItem>
        ) : (
          false
        )
      );
    }

    setPagination(mountPagination);

    // eslint-disable-next-line
  }, [currentPage, limitPage]);

  if (limitPage) {
    return (
      <Pagination
        aria-label="Pagination of repositories"
        className="d-flex justify-content-center mb-5"
      >
        <PaginationItem>
          <PaginationLink
            previous
            disabled={currentPage === 1}
            onClick={() => handlePagination(currentPage - 1)}
          />
        </PaginationItem>
        {pagination}
        <PaginationItem>
          <PaginationLink
            next
            disabled={currentPage === limitPage}
            onClick={() => handlePagination(currentPage + 1)}
          />
        </PaginationItem>
      </Pagination>
    );
  }

  return false;
}

CustomPagination.propTypes = {
  limitPage: PropTypes.number,
  handleClick: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

CustomPagination.defaultProps = {
  limitPage: 0,
};

export default CustomPagination;
