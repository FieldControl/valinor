import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { fetchNewPage } from '../store/actions/pagination';

const MAX_PAGE = 30;
const BottomPagination = ({ goToPage, baseCount, query, isSelected }) => {
  console.log(baseCount);

  return (
    <Pagination
      size="sm"
      aria-label="Page navigation example"
      style={ { display: 'flex',
        justifyContent: 'center' } }
      data-testid="bottom-pagination"
    >
      <PaginationItem disabled={ query === 'page=1' }>
        <PaginationLink
          tag="button"
          value="page=1"
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          {'<<'}
        </PaginationLink>
      </PaginationItem>

      <PaginationItem disabled={ query === 'page=1' }>
        <PaginationLink
          tag="button"
          value={ `page=${baseCount - 1}` }
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          {'<'}
        </PaginationLink>
      </PaginationItem>

      <PaginationItem
        data-testid="pagination-link-1"
        active={ `page=${baseCount - 2}` === query }
      >
        <PaginationLink
          tag="button"
          value={ `page=${baseCount - 2}` }
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          { `${baseCount - 2}` }
        </PaginationLink>
      </PaginationItem>

      <PaginationItem active={ `page=${baseCount - 1}` === query }>
        <PaginationLink
          tag="button"
          value={ `page=${baseCount - 1}` }
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          { `${baseCount - 1}` }
        </PaginationLink>
      </PaginationItem>

      <PaginationItem active={ `page=${baseCount}` === query }>
        <PaginationLink
          tag="button"
          value={ `page=${baseCount}` }
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          {baseCount}
        </PaginationLink>
      </PaginationItem>

      <PaginationItem
        active={ `page=${baseCount + 1}` === query }
        disabled={ baseCount === MAX_PAGE }
      >
        <PaginationLink
          tag="button"
          value={ `page=${baseCount + 1}` }
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          { `${baseCount + 1}` }
        </PaginationLink>
      </PaginationItem>

      <PaginationItem
        active={ `page=${baseCount + 2}` === query }
        disabled={ baseCount === MAX_PAGE || baseCount === MAX_PAGE - 1 }
      >
        <PaginationLink
          tag="button"
          value={ `page=${baseCount + 2}` }
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          { `${baseCount + 2}` }
        </PaginationLink>
      </PaginationItem>

      <PaginationItem disabled={ baseCount === MAX_PAGE }>
        <PaginationLink
          tag="button"
          value={ `page=${baseCount + 1}` }
          onClick={ (e) => goToPage(e.target.value, isSelected) }
        >
          {'>'}
        </PaginationLink>
      </PaginationItem>

      <PaginationItem disabled={ baseCount === MAX_PAGE }>
        <PaginationLink
          tag="button"
          value="page=30"
          onClick={ (e) => goToPage(e.target.value) }
        >
          {'>>'}
        </PaginationLink>
      </PaginationItem>
    </Pagination>
  );
};

BottomPagination.propTypes = {
  goToPage: PropTypes.func,
  query: PropTypes.string,
  baseCount: PropTypes.number,
  isSelected: PropTypes.bool,
}.isRequired;

const mapStateToProps = (state) => ({
  query: state.pagination.query,
  baseCount: state.pagination.baseCount,
  isSelected: state.repositories.isSelected,
});

const mapDispatchToProps = (dispatch) => ({
  goToPage: (newPage, isSelected) => dispatch(fetchNewPage(newPage, isSelected)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BottomPagination);
