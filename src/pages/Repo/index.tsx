/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tooltip } from '@material-ui/core';
import { useFavicon, useTitle } from 'react-use';

import { APIRepo } from '../../@types';

import api from '../../services/api';
import notify from '../../services/toast';

import languageColors from '../../utils/language-colors';
import kFormatter from '../../utils/kFormatter';
import useWindowSize from '../../utils/useWindowSize';

import { Error404, LoaderSpinner } from '../../components';

import { useStyles } from '../../styles/MaterialUI';
import {
  Container,
  Breadcrumb,
  Tabs,
  RepoIcon,
  Stats,
  StarIcon,
  ForkIcon,
  ActionsIcon,
  CodeIcon,
  InsightsIcon,
  PullRequestIcon,
  WikiIcon,
  SecurityIcon,
  SettingsIcon,
  ProjectsIcon,
  WatchIcon,
  Header,
  HeaderInfo,
  ForkedInfo,
  RepoInformation,
  RightSide,
  RepoInfoHeader,
  Row,
  LanguageDot,
  TagIcon,
  ReleaseInfo,
  Contributors,
  ContributorsCard,
  IssuesIcon,
  CommitsIcon,
  CheckIcon,
  HorizontalBar,
  LanguageBar,
} from './styles';

interface Data {
  repo?: APIRepo;
  error?: string;
}

interface Releases {
  name?: string;
  tag_name?: string;
  published_at?: string;
}

interface Commits {
  sha?: string;
  author?: {
    login?: string;
    avatar_url?: string;
  };
  commit?: {
    author?: {
      date?: string;
    };
    message?: string;
  };
}

const Repo: React.FC = () => {
  const { username, reponame } = useParams();
  const classes = useStyles();

  const [data, setData] = useState<Data>();
  const [repoLanguages, setLanguages] = useState([]);
  const [repoReleases, setReleases] = useState<Array<Releases>>([]);
  const [repoPulls, setPulls] = useState(0);
  const [repoIssues, setIssues] = useState(0);
  const [repoContributors, setContributors] = useState([]);
  const [repoCommits, setCommits] = useState<Array<Commits>>([]);
  const [emptyRepo, setEmptyRepo] = useState(false);
  const [loading, setLoading] = useState(true);

  useFavicon(`${window.location.origin}/favicon.ico`);

  const sumValues = obj => Object.values(obj).reduce((a: number, b: number) => a + b);
  const getPercentageValue = (value: number, total: number) => {
    const percentage = (value * 100) / total;
    return percentage.toFixed(2);
  };

  const size = useWindowSize();

  useEffect(() => {
    const element = document.getElementById('main-content');
    const elementRepo = document.getElementById('main-repo');

    if (elementRepo && element) {
      if (size.width <= 561 || size.height <= 768) {
        element.style.height = 'calc(100% - 54px)';
        if (elementRepo) elementRepo.style.height = 'auto';
      } else if (size.width > 561) {
        element.style.height = '100%';
        elementRepo.style.height = 'calc(100vh - 94px)';
      }
    }
  }, [size]);

  useEffect(() => {
    async function loadRepoInfo() {
      setLoading(true);
      try {
        const repoResponse = await api.get(`repos/${username}/${reponame}`);
        const repo = repoResponse.data;
        setData({ repo });

        const commitsResponse = await api.get(`repos/${username}/${reponame}/commits`);
        const commits = commitsResponse.data;
        setCommits(commits);

        const releasesResponse = await api.get(`repos/${username}/${reponame}/releases`);
        const releases = releasesResponse.data;
        setReleases(releases);

        const languagesResponse = await api.get(`repos/${username}/${reponame}/languages`);
        const languages = languagesResponse.data;
        if (Object.keys(languages).length > 0) {
          const allMb = sumValues(languages);
          const languageKeys = Object.keys(languages);
          const calculatedLanguages = languageKeys.map(lang => {
            return { language: lang, percentage: getPercentageValue(languages[lang], Number(allMb)) };
          });
          if (calculatedLanguages.length > 7) {
            const mainLanguages = calculatedLanguages.slice(0, 6); // 6 languages
            const slicedLanguages = calculatedLanguages.slice(6, calculatedLanguages.length); // other languages
            let remainingValues = 0;
            slicedLanguages.forEach(lng => {
              remainingValues += Number(lng.percentage);
            });
            mainLanguages.push({ language: 'Other', percentage: String(remainingValues.toFixed(2)) });
            setLanguages(mainLanguages);
          } else setLanguages(calculatedLanguages);
        }

        const pullsResponse = await api.get(`repos/${username}/${reponame}/pulls?per_page=100`);
        const pulls = pullsResponse.data;
        setPulls(pulls.length > 0 ? pulls.length : 0);

        // const issuesResponse = await api.get(`repos/${username}/${reponame}/issues?per_page=100`);
        // const issues = issuesResponse.data;
        setIssues(repo.open_issues > 0 ? repo.open_issues - (pulls.length > 0 ? pulls.length : 0) : repo.open_issues);

        const contributorsResponse = await api.get(`repos/${username}/${reponame}/contributors`);
        const contributors = contributorsResponse.data;
        const shuffledContributors = contributors.sort(() => 0.5 - Math.random());
        const slicedContributors = shuffledContributors.slice(0, 7);
        setContributors(slicedContributors);
      } catch (err) {
        const error = err?.response?.data?.message ? err.response.data.message : err.message;
        switch (error) {
          case 'Not Found':
            setData({ error: 'Repository not found!' });
            break;
          case 'Git Repository is empty.':
            setEmptyRepo(true);
            break;
          default:
            break;
        }
        notify(error, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadRepoInfo();
  }, [reponame, username]);

  useTitle(`GitHub UI Clone${loading || data?.error ? '' : ` | ${username}/${reponame}`}`);

  function getLanguageColor(language) {
    const languageName = language ? language.replace(' ', '-').toLowerCase() : 'other';
    return languageColors[languageName];
  }

  function getReleaseDate(date) {
    const dateStr = new Date(Date.parse(date));
    return dateStr.toDateString();
  }

  const TabContent = () => (
    <>
      <Tooltip title="Repository's Code page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content active" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}`, 'blank')}>
          <CodeIcon />
          <span className="label">Code</span>
        </div>
      </Tooltip>
      <Tooltip title="Repository's Issues page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/issues`, 'blank')}>
          <IssuesIcon />
          <span className="label">Issues</span>
          {repoIssues > 0 && <span className="number">{repoIssues}</span>}
        </div>
      </Tooltip>
      <Tooltip title="Repository's Pull requests page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/pulls`, 'blank')}>
          <PullRequestIcon />
          <span className="label">Pull requests</span>
          {repoPulls > 0 && <span className="number">{repoPulls}</span>}
        </div>
      </Tooltip>
      <Tooltip title="Repository's Actions page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/actions`, 'blank')}>
          <ActionsIcon />
          <span className="label">Actions</span>
        </div>
      </Tooltip>
      <Tooltip title="Repository's Projects page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/projects`, 'blank')}>
          <ProjectsIcon />
          <span className="label">Projects</span>
        </div>
      </Tooltip>
      <Tooltip title="Repository's Wiki page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/wiki`, 'blank')}>
          <WikiIcon />
          <span className="label">Wiki</span>
        </div>
      </Tooltip>
      <Tooltip title="Repository's Security page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/security`, 'blank')}>
          <SecurityIcon />
          <span className="label">Security</span>
        </div>
      </Tooltip>
      <Tooltip title="Repository's Insights page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/pulse`, 'blank')}>
          <InsightsIcon />
          <span className="label">Insights</span>
        </div>
      </Tooltip>
      <Tooltip title="Repository's Settings page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" role="button" onClick={() => window.open(`https://github.com/${username}/${reponame}/settings`, 'blank')}>
          <SettingsIcon />
          <span className="label">Settings</span>
        </div>
      </Tooltip>
    </>
  );

  if (loading) {
    return <LoaderSpinner color="#6a737d" />;
  }

  if (data?.error || !data?.repo) {
    return (
      <>
        <Error404 />
      </>
    );
  }

  return (
    <Container id="main-repo">
      <Header>
        <HeaderInfo>
          <Breadcrumb>
            {data.repo?.fork ? <ForkIcon /> : <RepoIcon />}

            <div className="repo-credentials">
              <Link className="username" to={`/${username}`}>
                {username}
              </Link>

              <span>/</span>
              <Tooltip title="View repository on GitHub" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                <a href={`https://github.com/${username}/${reponame}`} target="_blank" rel="noopener noreferrer" className="reponame">
                  {reponame}
                </a>
              </Tooltip>
            </div>
          </Breadcrumb>

          <Stats>
            <Tooltip title={`${data.repo.subscribers_count} users are watching this repository`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
              <li onClick={() => window.open(`https://github.com/${username}/${reponame}/watchers`, 'blank')} role="link">
                <WatchIcon />
                <span>Watch</span>
                <b>{kFormatter(data.repo.subscribers_count)}</b>
              </li>
            </Tooltip>
            <Tooltip title={`This repository has ${data.repo.stargazers_count} stars`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
              <li onClick={() => window.open(`https://github.com/${username}/${reponame}/stargazers`, 'blank')} role="link">
                <StarIcon />
                <span>Star</span>
                <b>{kFormatter(data.repo.stargazers_count)}</b>
              </li>
            </Tooltip>
            <Tooltip
              title={`This repository was forked by ${data.repo?.fork && data.repo?.parent?.forks_count ? data.repo.parent.forks_count : data.repo.forks} users`}
              placement="bottom"
              arrow
              classes={{ tooltip: classes.tooltip }}
            >
              <li onClick={() => window.open(`https://github.com/${username}/${reponame}/network/members`, 'blank')} role="link">
                <ForkIcon />
                <span>Fork</span>
                <b>{data.repo?.fork && data.repo?.parent?.forks_count ? kFormatter(data.repo.parent.forks_count) : kFormatter(data.repo.forks)}</b>
              </li>
            </Tooltip>
          </Stats>
        </HeaderInfo>

        <ForkedInfo>
          {data.repo?.fork && data.repo?.parent?.full_name ? (
            <>
              {`forked from `}
              <a href={`https://github.com/${data.repo.parent.full_name}`} target="_blank" rel="noopener noreferrer">
                {data.repo.parent.full_name}
              </a>
            </>
          ) : null}
        </ForkedInfo>
        <Tabs>
          <TabContent />
        </Tabs>
      </Header>

      <RepoInformation>
        <RightSide>
          <RepoInfoHeader>
            {emptyRepo ? (
              <div className="empty-repo">
                <span>Repository is empty</span>
              </div>
            ) : (
              <>
                <div className="commiter">
                  {repoCommits[0]?.author?.avatar_url && (
                    <Tooltip title={`Go to ${repoCommits[0].author.login} profile`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                      <a href={`/${repoCommits[0].author.login}`} target="_blank" rel="noopener noreferrer">
                        <img src={repoCommits[0].author.avatar_url} alt={repoCommits[0].author.login} />
                      </a>
                    </Tooltip>
                  )}
                  {repoCommits[0]?.author?.login && (
                    <span className="user">
                      <Tooltip title={`See commits from ${repoCommits[0].author.login}`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                        <a href={`https://github.com/${username}/${reponame}/commits?author=${repoCommits[0]?.author?.login}`} target="_blank" rel="noopener noreferrer">
                          {repoCommits[0].author.login}
                        </a>
                      </Tooltip>
                    </span>
                  )}
                  {repoCommits[0]?.commit?.message && (
                    <span className="message">
                      <a href={`https://github.com/${username}/${reponame}/commit/${repoCommits[0].sha}`} target="_blank" rel="noopener noreferrer">
                        {repoCommits[0].commit.message}
                      </a>
                    </span>
                  )}
                </div>
                <div className="commiter-sha">
                  <CheckIcon />
                  <Tooltip title="See commit on GitHub" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                    <a href={`https://github.com/${username}/${reponame}/commit/${repoCommits[0].sha}`} target="_blank" rel="noopener noreferrer">
                      {repoCommits[0].sha}
                    </a>
                  </Tooltip>
                </div>
                <div className="last-commit">
                  <Tooltip title="See commit on GitHub" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                    <a href={`https://github.com/${username}/${reponame}/commit/${repoCommits[0].sha}`} target="_blank" rel="noopener noreferrer">
                      {`on ${getReleaseDate(repoCommits[0]?.commit?.author?.date)}`}
                    </a>
                  </Tooltip>
                </div>
                <div className="number-commits">
                  <CommitsIcon />

                  <Tooltip title="See all commits on GitHub" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                    <a href={`https://github.com/${username}/${reponame}/commits/master`} target="_blank" rel="noopener noreferrer">
                      {`${repoCommits.length} commits`}
                    </a>
                  </Tooltip>
                </div>
              </>
            )}
          </RepoInfoHeader>

          {data.repo?.description && (
            <Row>
              <h4>About</h4>
              <p>{data.repo.description}</p>

              {/* <LinkButton href={data.repo.html_url}>
              <GithubIcon />
              <span>View on GitHub</span>
            </LinkButton> */}
            </Row>
          )}
          {repoLanguages.length > 0 && (
            <Row>
              <h4>Languages</h4>

              <HorizontalBar>
                {repoLanguages.map(lng => (
                  <LanguageBar color={getLanguageColor(lng.language)} size={lng.percentage} key={lng.language} />
                ))}
              </HorizontalBar>

              <ul className="languages">
                {repoLanguages.map((lng, index) => (
                  <li key={index}>
                    <LanguageDot color={getLanguageColor(lng.language)} />
                    <span>{`${lng.language}: ${lng.percentage}%`}</span>
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {repoReleases.length > 0 && (
            <Row>
              <h4>Releases</h4>

              <ReleaseInfo>
                <div className="tag-icon">
                  <TagIcon />
                </div>
                <div className="info">
                  <Tooltip title="See more details on GitHub" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                    <a href={`https://github.com/${username}/${reponame}/releases/tag/${repoReleases[0].tag_name}`} target="_blank" rel="noopener noreferrer">
                      <h4>{repoReleases[0].name}</h4>
                      <span>{getReleaseDate(repoReleases[0].published_at)}</span>
                    </a>
                  </Tooltip>
                </div>
                <span className="latest">Latest</span>
              </ReleaseInfo>

              {repoReleases.length - 1 > 0 && (
                <a href={`https://github.com/${username}/${reponame}/releases`} target="_blank" rel="noopener noreferrer" className="link">
                  see more releases
                </a>
              )}
            </Row>
          )}
          {repoContributors.length > 0 && (
            <Row>
              <h4>Contributors</h4>

              <Contributors>
                {repoContributors.map(contributor => (
                  <ContributorsCard key={contributor?.login}>
                    <Tooltip title={`Go to ${contributor.login}`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                      <a href={`https://github.com/${contributor.login}`} target="_blank" rel="noopener noreferrer">
                        <img src={contributor?.avatar_url} alt={contributor.login} />
                      </a>
                    </Tooltip>
                  </ContributorsCard>
                ))}
              </Contributors>

              <a href={`https://github.com/${username}/${reponame}/graphs/contributors`} target="_blank" rel="noopener noreferrer" className="link">
                see all contributors
              </a>
            </Row>
          )}
        </RightSide>
      </RepoInformation>
    </Container>
  );
};

export default Repo;
