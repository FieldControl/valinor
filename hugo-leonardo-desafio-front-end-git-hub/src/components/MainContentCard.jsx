import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Card, CardFooter, CardBody, CardLink,
  CardTitle, CardText, Alert } from 'reactstrap';
import { connect } from 'react-redux';

import star from '../assets/Star.svg';
import repo from '../assets/Repo.svg';
import issue from '../assets/Issue.svg';

const MainContentCard = ({ url, title, text, links, footer, isSelected,
  comments, description, dependencies, stargazersUrl, stargazersCount, language,
  openIssuesCount }) => {
  const handleUpdatedDisplay = (date) => {
    const fromNow = moment(date, 'YYYYMMDD').fromNow();
    return fromNow;
  };

  const handleUrlTitleTrim = (urlTitle) => {
    const arr = urlTitle.split('/');
    const name = `${arr[arr.length - 2]}/${arr[arr.length - 1]}`;
    return name;
  };

  useEffect(() => handleUpdatedDisplay(footer), []);

  return (
    <div>
      {isSelected ? (
        <Card
          body
          inverse
          style={ {
            backgroundColor: '#212529', borderColor: '#333', marginBottom: '20px' } }
        >
          <CardBody>
            <CardTitle
              tag="h5"
              style={ { display: 'flex',
                textDecoration: 'auto',
                justifyContent: 'flex-start' } }
            >
              <img src={ repo } alt={ repo } />
              <a
                style={ { marginLeft: '20px' } }
                href={ title }
              >
                {handleUrlTitleTrim(title)}
              </a>
            </CardTitle>
            <CardText>{text}</CardText>
          </CardBody>
          <CardFooter
            style={ { display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'baseline' } }
          >
            <CardText>
              <a
                href={ stargazersUrl }
                style={ { color: '#6c757d', textDecoration: 'auto' } }
              >
                <img src={ star } alt={ star } />
                {stargazersCount}
              </a>
            </CardText>
            <CardText>
              {language}
            </CardText>
            <CardText>
              {`Updated ${handleUpdatedDisplay(footer)}`}
            </CardText>
            <CardText>
              <a
                href={ openIssuesCount }
                style={ { color: '#6c757d', textDecoration: 'auto' } }
              >
                {`Issues need help ${openIssuesCount}`}
              </a>
            </CardText>
          </CardFooter>
        </Card>
      ) : (
        <Card style={ { marginBottom: '20px' } }>
          <CardBody>
            <CardTitle
              tag="h5"
              style={ { display: 'flex',
                justifyContent: 'flex-start' } }
            >
              <img
                src={ issue }
                alt={ issue }

              />
              <a href={ links }>{title}</a>
              <p style={ { fontSize: '12px' } }>
                {`#${links.split('/')[links.split('/').length - 1]}`}

              </p>
            </CardTitle>
            <CardTitle tag="h6" style={ { display: 'flex' } }>
              <a
                href={ `https://github.com/${handleUrlTitleTrim(url)}/issues` }
                style={ { display: 'flex',
                  marginLeft: '36px',
                  flexDirection: 'column' } }
              >
                {handleUrlTitleTrim(url)}
              </a>
            </CardTitle>

            <CardText>{description}</CardText>
            {dependencies.length > 0 ? (
              <Alert
                color="secondary"
                style={ { maxWidth: 'fit-content',
                  padding: '2px',
                  borderRadius: '20px' } }
              >
                {dependencies}
              </Alert>
            ) : null}
            <CardLink href={ `https://github.com/${text}` }>{`by ${text}`}</CardLink>
          </CardBody>
          <CardFooter style={ { display: 'flex', justifyContent: 'space-around' } }>
            <CardText>{`Opened ${handleUpdatedDisplay(footer)}`}</CardText>
            <CardText>{`Comments ${comments}`}</CardText>
            {/* <CardText>{`Status ${status}`}</CardText> */}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

MainContentCard.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  links: PropTypes.string,
  footer: PropTypes.string,
  status: PropTypes.string,
  comments: PropTypes.number,
  stargazersUrl: PropTypes.string,
  stargazersCount: PropTypes.number,
  openIssuesCount: PropTypes.number,
}.isRequired;

const mapStateToProps = (state) => ({
  isSelected: state.repositories.isSelected,
  issues: state.issues.results,
});

export default connect(mapStateToProps)(MainContentCard);
