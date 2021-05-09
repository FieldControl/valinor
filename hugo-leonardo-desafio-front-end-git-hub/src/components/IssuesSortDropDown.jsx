import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap';
import { sortMostCommented, sortLeastCommented, sortNewest, sortOldest,
  sortRecentlyUpdated, sortLeastRecentUp,
} from '../store/actions/issuesSort';

const RepositoriesSortDropDown = ({ sortByMostCommented, sortByLeastCommented,
  sortByNewest, sortByOldest, sortByRecentlyUpdated, sortByLeastRecentlyUpdated,
  query }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown data-testid="nav-bar-dropdown" isOpen={ dropdownOpen } toggle={ toggle }>

      <DropdownToggle caret>
        Sort by:
        {' '}
        <Badge color="secondary">Best match</Badge>
      </DropdownToggle>

      <DropdownMenu>
        <DropdownItem>Best match</DropdownItem>
        <DropdownItem divider />

        <DropdownItem
          onClick={ () => sortByMostCommented(query) }
        >
          Most commented
        </DropdownItem>

        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByLeastCommented(query) }>
          Fewest commented
        </DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByNewest(query) }>Newest</DropdownItem>
        <DropdownItem divider />

        <DropdownItem onClick={ () => sortByOldest(query) }>
          Oldest
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
  sortByMostCommented: PropTypes.func,
  query: PropTypes.string,
}.isRequired;

const mapStateToProps = (state) => ({
  sortBy: state.repositories.sortBy,
  query: state.repositories.input,
});

const mapDispatchToProps = (dispatch) => ({
  sortByMostCommented: (query) => dispatch(sortMostCommented(query)),
  sortByLeastCommented: (query) => dispatch(sortLeastCommented(query)),
  sortByNewest: (query) => dispatch(sortNewest(query)),
  sortByOldest: (query) => dispatch(sortOldest(query)),
  sortByRecentlyUpdated: (query) => dispatch(sortRecentlyUpdated(query)),
  sortByLeastRecentlyUpdated: (query) => dispatch(sortLeastRecentUp(query)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RepositoriesSortDropDown);
