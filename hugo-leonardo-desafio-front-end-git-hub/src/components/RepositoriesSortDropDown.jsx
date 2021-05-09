import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap';
import { sortMostStars, sortFewestStars, sortMostForks, sortFewestForks,
  sortRecentlyUpdated, sortLeastRecentlyUpdated,
} from '../store/actions/reposiroriesSort';

const RepositoriesSortDropDown = ({ sortByMostStars, sortByFewestStars, sortByMostForks,
  sortByFewestForks, sortByRecentlyUpdated, sortByLeastRecentlyUpdated, query,
  results }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown
      data-testid="nav-bar-dropdown"
      disabled={ results.length === 0 }
      isOpen={ dropdownOpen }
      toggle={ toggle }
    >

      <DropdownToggle caret>
        Sort by:
        {' '}
        <Badge color="secondary">Best match</Badge>
      </DropdownToggle>

      <DropdownMenu>
        <DropdownItem>Best match</DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByMostStars(query) }>Most stars</DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByFewestStars(query) }>
          Fewest stars
        </DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByMostForks(query) }>Most forks</DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByFewestForks(query) }>
          Fewest forks
        </DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByRecentlyUpdated(query) }>
          Recently updated
        </DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByLeastRecentlyUpdated(query) }>
          Least recently updated
        </DropdownItem>
        <DropdownItem divider />

      </DropdownMenu>
    </Dropdown>
  );
};

RepositoriesSortDropDown.propTypes = {
  sortByMostStars: PropTypes.func,
  query: PropTypes.string,
  results: PropTypes.arrayOf({}),
}.isRequired;

const mapStateToProps = (state) => ({
  sortBy: state.repositories.sortBy,
  query: state.repositories.input,
  results: state.repositories.results,
});

const mapDispatchToProps = (dispatch) => ({
  sortByMostStars: (query) => dispatch(sortMostStars(query)),
  sortByFewestStars: (query) => dispatch(sortFewestStars(query)),
  sortByMostForks: (query) => dispatch(sortMostForks(query)),
  sortByFewestForks: (query) => dispatch(sortFewestForks(query)),
  sortByRecentlyUpdated: (query) => dispatch(sortRecentlyUpdated(query)),
  sortByLeastRecentlyUpdated: (query) => dispatch(sortLeastRecentlyUpdated(query)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RepositoriesSortDropDown);
