/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTitle } from 'react-use';
import { Tooltip } from '@material-ui/core';

import { ProfileData, Error404, LoaderSpinner, RandomCalendar, RepoCard } from '../../components';

import { APIUser, APIRepo } from '../../@types';

import api from '../../services/api';
import notify from '../../services/toast';

import kFormatter from '../../utils/kFormatter';
import useWindowSize from '../../utils/useWindowSize';

import { useStyles } from '../../styles/MaterialUI';
import { Container, Main, LeftSide, RightSide, Repos, CalendarHeading, RepoIcon, OverViewIcon, ProjectsIcon, PackagesIcon, Tab } from './styles';

interface Data {
  user?: APIUser;
  repos?: APIRepo[];
  error?: string;
}

const Profile: React.FC = () => {
  const { username = 'FieldControl' } = useParams();
  const classes = useStyles();

  const [data, setData] = useState<Data>();
  const [panelActive, setPanelActive] = useState(1);
  const [repositories, setRepos] = useState([]);
  const [organizations, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const size = useWindowSize();

  useEffect(() => {
    const element = document.getElementById('main-content');
    const elementProfile = document.getElementById('main-profile');
    if (panelActive === 2) {
      element.style.height = 'calc(100% - 54px)';
    } else if (panelActive === 1) {
      if (size.height <= 968) {
        element.style.height = 'calc(100% - 54px)';
        if (elementProfile) elementProfile.style.height = 'auto';
      } else if (size.width >= 768) element.style.height = '100%';
    }
  }, [panelActive, size]);

  useEffect(() => {
    async function loadUserInfo() {
      setLoading(true);
      try {
        const userResponse = await api.get(`users/${username}`);
        const user = userResponse.data;

        const reposResponse = await api.get(`users/${username}/repos?per_page=100`);
        const repos = reposResponse.data;
        setRepos(repos);

        const orgsResponse = await api.get(`users/${username}/orgs?per_page=100`);
        const orgs = orgsResponse.data;
        setOrgs(orgs);

        const shuffledRepos = repos.sort(() => 0.5 - Math.random());
        const slicedRepos = shuffledRepos.slice(0, 6); // 6 repos

        setData({
          user,
          repos: slicedRepos,
        });
      } catch (err) {
        const error = err?.response?.data?.message ? err.response.data.message : err.message;
        setData({ error });
        notify(error, 'error');
      } finally {
        setLoading(false);
      }
    }
    setData({});
    loadUserInfo();
  }, [username]);

  useTitle(`Projeto${loading || data?.error ? '' : ` | ${data.user.name}`}`);

  if (loading) {
    return <LoaderSpinner color="#6a737d" />;
  }

  if (data?.error) {
    return <Error404 />;
  }

  const TabContent = () => (
    <>
      <Tooltip title="User's Overview page" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className={`content ${panelActive === 1 ? ' active' : ''}`} onClick={() => setPanelActive(1)} role="button">
          <OverViewIcon />
          <span className="label">Overview</span>
        </div>
      </Tooltip>
      <Tooltip title="User's Repositories" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className={`content ${panelActive === 2 ? ' active' : ''}`} onClick={() => setPanelActive(2)} role="button">
          <RepoIcon />
          <span className="label">Repositories</span>
          <span className="number">{kFormatter(data.user?.public_repos)}</span>
        </div>
      </Tooltip>
      <Tooltip title="Go to user's projects" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" onClick={() => window.open(`https://github.com/${data.user.login}?tab=projects`, '_blank')} role="button">
          <ProjectsIcon />
          <span className="label">Projects</span>
        </div>
      </Tooltip>
      <Tooltip title="Go to user's packages" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
        <div className="content" onClick={() => window.open(`https://github.com/${data.user.login}?tab=packages`, '_blank')} role="button">
          <PackagesIcon />
          <span className="label">Packages</span>
        </div>
      </Tooltip>
    </>
  );

  return (
    <Container panelActive={panelActive} id="main-profile">
      <Tab className="desktop">
        <div className="wrapper">
          <span className="offset" />
          <TabContent />
        </div>

        <span className="line" />
      </Tab>

      <Main>
        <LeftSide>
          <ProfileData
            type={data.user?.type}
            username={data.user.login}
            bio={data.user?.bio}
            name={data.user.name}
            avatarUrl={data.user.avatar_url}
            followers={data.user.followers}
            following={data.user.following}
            company={data.user.company}
            location={data.user.location}
            email={data.user.email}
            blog={data.user.blog}
            twitter={data.user?.twitter_username}
            orgs={organizations}
          />
        </LeftSide>

        <RightSide>
          <Tab className="mobile">
            <TabContent />
          </Tab>
          {panelActive === 1 ? (
            <>
              <Repos>
                <h2>{data?.repos.length > 0 ? 'Random Repositories' : 'User does not have any public repositories yet'}</h2>

                <div>
                  {data.repos.map(item => (
                    <RepoCard
                      key={item.name}
                      username={item.owner.login}
                      reponame={item.name}
                      description={item.description}
                      language={item.language}
                      stars={item.stargazers_count}
                      forks={item.forks}
                      isForked={item?.fork ? item?.fork : false}
                    />
                  ))}
                </div>
              </Repos>

              <Tooltip title="Does not represent actual contribution data" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                <CalendarHeading>{`${kFormatter(Math.floor(Math.random() * (2000 - 1)) + 1)} contributions in the last year`}</CalendarHeading>
              </Tooltip>

              <RandomCalendar />
            </>
          ) : (
            <>
              <Repos>
                <h2>Repositories</h2>
                {data?.repos.length > 0 && (
                  <Tooltip title={`see all repositories from ${username}`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                    <a href={`https://github.com/${username}?tab=repositories`} className="repo-link" target="_blank" rel="noopener noreferrer">
                      see all repositories
                    </a>
                  </Tooltip>
                )}
                <div>
                  {repositories.map(item => (
                    <RepoCard
                      key={item.name}
                      username={item.owner.login}
                      reponame={item.name}
                      description={item.description}
                      language={item.language}
                      stars={item.stargazers_count}
                      forks={item.forks}
                      isForked={item?.fork ? item?.fork : false}
                    />
                  ))}
                </div>
              </Repos>
            </>
          )}
        </RightSide>
      </Main>
    </Container>
  );
};

export default Profile;
