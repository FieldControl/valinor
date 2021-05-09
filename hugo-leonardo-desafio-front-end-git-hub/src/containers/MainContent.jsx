import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';
import MainContentCard from '../components/MainContentCard';
import ErrorModal from '../components/ErrorModal';
// import BottomPagination from '../components/BottomPagination';

// const CARD_LIMIT = 3;
const MainContent = ({ reposResults, issuesResults, totalRepos, isSelected,
  totalIssues, error }) => {
  if (error.length > 0) {
    return <ErrorModal />;
  }
  return (
    <div>
      <h2>
        {isSelected
          ? `Repositories results: ${totalRepos}` : `Issues results ${totalIssues}`}
      </h2>

      {reposResults.length < 1 ? (<div>Loading</div>) : (
        <Container className="themed-container">
          {isSelected ? reposResults.map((e, i) => (
            <MainContentCard
              key={ i }
              title={ e.html_url }
              text={ e.description }
              links={ e.url }
              footer={ e.updated_at }
              stargazersUrl={ e.stargazers_url }
              stargazersCount={ e.stargazers_count }
              openIssuesCount={ e.open_issues_count }
              language={ e.language }
            >
              {e}
            </MainContentCard>
          )) : (
            issuesResults.map((e, i) => (
              <MainContentCard
                key={ i }
                url={ e.repository_url }
                title={ e.title }
                text={ e.user.login }
                links={ e.html_url }
                footer={ e.created_at }
                status={ e.state }
                comments={ e.comments }
                description={ e.labels.length > 0 ? e.labels[0].description : '' }
                dependencies={ e.labels.length > 0 ? e.labels[0].name : '' }
              >
                {e}
              </MainContentCard>
            )))}
        </Container>
      )}
    </div>
  );
};

MainContent.propTypes = {
  results: PropTypes.string,
  totalCount: PropTypes.number,
  isSelected: PropTypes.bool,
}.isRequired;

const mapStateToProps = (state) => ({
  reposResults: state.repositories.results,
  totalRepos: state.repositories.totalCount,
  isSelected: state.repositories.isSelected,
  issuesResults: state.issues.results,
  totalIssues: state.issues.totalCount,
  error: state.issues.error,
});

export default connect(mapStateToProps)(MainContent);
