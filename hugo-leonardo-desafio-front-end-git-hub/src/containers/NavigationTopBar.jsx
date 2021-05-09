import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
} from 'reactstrap';
import GitHubBrand from '../components/GitHubBrand';
import GroupButtons from '../components/GroupButtons';
import SearchForm from '../components/SearchForm';
import RepositoriesSortDropDown from '../components/RepositoriesSortDropDown';
import IssuesSortDropDown from '../components/IssuesSortDropDown';

const NavigationTopBar = ({ isSelected }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="dark" dark expand="md" data-testid="nav-bar">
      <NavbarBrand
        style={ { marginLeft: '20px' } }
        href="/"
      >
        <GitHubBrand />

      </NavbarBrand>
      <NavbarToggler
        style={ { marginRight: '20px' } }
        onClick={ toggle }
        data-testid="nav-bar-toggle"
      />
      <Collapse isOpen={ isOpen } navbar>
        <Nav className="mr-auto" navbar>
          <NavItem>
            <SearchForm />
          </NavItem>
          <NavItem>
            <GroupButtons />
          </NavItem>
          <NavItem style={ { marginLeft: '10px' } }>
            {isSelected ? (
              <RepositoriesSortDropDown />
            ) : (
              <IssuesSortDropDown />
            )}
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};

NavigationTopBar.propTypes = {
  isSelected: PropTypes.bool,
}.isRequired;

const mapStateToProps = (state) => ({
  isSelected: state.repositories.isSelected,
});

export default connect(mapStateToProps)(NavigationTopBar);
