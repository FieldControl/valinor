/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/jsx-indent */
import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@material-ui/core';

import languageColors from '../../utils/language-colors';
import kFormatter from '../../utils/kFormatter';

import { useStyles } from '../../styles/MaterialUI';
import { Container, Topside, RepoIcon, Botside, StarIcon, ForkIcon, LanguageDot } from './styles';

interface Props {
  username: string;
  reponame: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  isForked: boolean;
}

const RepoCard: React.FC<Props> = ({ username, reponame, description, language, stars, forks, isForked }) => {
  const classes = useStyles();

  const languageName = language ? language.replace(' ', '-').toLowerCase() : 'other';
  const languageColor = languageColors[languageName];
  return (
    <Container>
      <Topside>
        <header>
          {isForked ? <ForkIcon /> : <RepoIcon />}
          <Tooltip title={`Go to ${reponame}`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
            <Link to={`/${username}/${reponame}`}>{reponame}</Link>
          </Tooltip>
        </header>
        <p>{description}</p>
      </Topside>

      <Botside>
        <ul>
          {language && (
            <Tooltip title={`Repository main language: ${language}`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
              <li>
                <LanguageDot color={languageColor || '#8257e5'} />
                <span>{language}</span>
              </li>
            </Tooltip>
          )}
          {stars && stars > 0 ? (
            <Tooltip title={`Repository has ${stars} stars`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
              <li>
                <StarIcon />
                <span>{kFormatter(stars)}</span>
              </li>
            </Tooltip>
          ) : null}
          {forks && forks > 0 ? (
            <Tooltip title={`Repository was forked by ${forks} users`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
              <li>
                <ForkIcon />
                <span>{kFormatter(forks)}</span>
              </li>
            </Tooltip>
          ) : null}
        </ul>
      </Botside>
    </Container>
  );
};

export default RepoCard;
