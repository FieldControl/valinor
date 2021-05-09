import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { handleSearchInput, fetchSearchQuery } from '../store/actions/repositories';

const SearchForm = ({ searchInput, fetchSearch, query }) => (
  <Form
    inline
    style={ { display: 'flex', flexDirection: 'row', alignItems: 'flex-end' } }
  >
    <FormGroup style={ { display: 'flex' } }>
      <Input
        value={ query }
        type="text"
        name="search"
        id="search"
        placeholder="Type a query to search. Ex: node"
        onChange={ (e) => searchInput(e.target.value) }
        style={ { marginLeft: '10px' } }
      />
    </FormGroup>

    <Button
      onClick={ () => fetchSearch(query) }
      disabled={ query.length === 0 }
      style={ { marginLeft: '10px',
        marginRight: '10px' } }
    >
      Search
    </Button>
  </Form>
);

SearchForm.propTypes = {
  searchInput: PropTypes.func,
  fetchSearch: PropTypes.func,
  query: PropTypes.string,
}.isRequired;

const mapStateToProps = (state) => ({
  query: state.repositories.input,
});

const mapDispatchToProps = (dispatch) => ({
  searchInput: (input) => dispatch(handleSearchInput(input)),
  fetchSearch: (query) => dispatch(fetchSearchQuery(query)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchForm);
