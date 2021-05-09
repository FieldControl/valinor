import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ButtonGroup, Button, Badge } from 'reactstrap';
import { toggleRepoOrIssues } from '../store/actions/repositories';

const TEN_MILLIONS = 10000000;
const ONE_MILLION = 1000000;
const ONE_HUNDRED_THOUSAND = 100000;
const ONE_THOUSAND = 1000;
const FIRST_THREE_NUMBERS = 3;
const FIRST_TWO_NUMBERS = 2;

const setBadgeCount = (totalCount, setCount) => {
  if (totalCount > TEN_MILLIONS) {
    return setCount(`${totalCount.toString().substr(0, FIRST_TWO_NUMBERS)}M`);
  }
  if (totalCount > ONE_MILLION && totalCount < TEN_MILLIONS) {
    return setCount('1M');
  }
  if (totalCount > ONE_HUNDRED_THOUSAND && totalCount < ONE_MILLION) {
    return setCount(`${totalCount.toString().substr(0, FIRST_THREE_NUMBERS)}K`);
  }
  if (totalCount > ONE_THOUSAND && totalCount < ONE_MILLION) {
    return setCount(`${totalCount.toString().substr(0, FIRST_TWO_NUMBERS)}K`);
  }
  return setCount(`${totalCount}`);
};

function GroupButtons({ repoCount, issuesCount, toggleRepoIssue }) {
  const [repos, setRepoCount] = useState('0');
  const [issues, setIssuesCount] = useState('0');

  useEffect(() => setBadgeCount(repoCount, setRepoCount), [repoCount]);

  useEffect(() => setBadgeCount(issuesCount, setIssuesCount), [issuesCount]);

  return (
    <ButtonGroup data-testid="nav-bar-btn-group">
      <Button
        disabled={ repos === '0' }
        onClick={ () => toggleRepoIssue(true) }
      >
        Repositories
        {' '}
        <Badge style={ { backgroundColor: '#212529' } }>{repos}</Badge>
      </Button>
      <Button
        disabled={ issues === '0' }
        onClick={ () => toggleRepoIssue(false) }
      >
        Issues
        {' '}
        <Badge style={ { backgroundColor: '#212529' } }>{issues}</Badge>
      </Button>
    </ButtonGroup>
  );
}

GroupButtons.propTypes = {
  repoCount: PropTypes.number,
  issuesCount: PropTypes.number,
  goToIssues: PropTypes.func,
  toggleRepoIssue: PropTypes.func,
}.isRequired;

const mapStateToProps = (state) => ({
  repoCount: state.repositories.totalCount,
  issuesCount: state.issues.totalCount,
});

const mapDispatchToProps = (dispatch) => ({
  toggleRepoIssue: (bool) => dispatch(toggleRepoOrIssues(bool)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GroupButtons);
