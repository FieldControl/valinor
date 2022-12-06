/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { Tooltip } from '@material-ui/core';

import kFormatter from '../../utils/kFormatter';

import { useStyles } from '../../styles/MaterialUI';
import {
  Container,
  Flex,
  Avatar,
  Row,
  PeopleIcon,
  Column,
  CompanyIcon,
  LocationIcon,
  EmailIcon,
  BlogIcon,
  TwitterIcon,
  Organizations,
  OrganizationsContainer,
  OrganizationCard,
} from './styles';

interface Orgs {
  login?: string;
  id?: number;
  node_id?: string;
  url?: string;
  repos_url?: string;
  events_url?: string;
  hooks_url?: string;
  issues_url?: string;
  members_url?: string;
  public_members_url?: string;
  avatar_url?: string;
  description?: string;
}

interface Props {
  username: string;
  type: string;
  name: string;
  avatarUrl: string;
  followers: number;
  following: number;
  company: string;
  location: string;
  email: string;
  blog: string;
  bio: string;
  twitter: string;
  orgs: Array<Orgs>;
}

const ProfileData: React.FC<Props> = ({ username, type, name, avatarUrl, followers, following, company, location, email, blog, bio, twitter, orgs }) => {
  const classes = useStyles();

  return (
    <Container>
      <Flex>
        <Tooltip title="Go to user's GitHub profile" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
          <Avatar src={avatarUrl} alt={username} onClick={() => window.open(`https://github.com/${username}`, 'blank')} />
        </Tooltip>

        <div>
          <h1>{name}</h1>

          <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">
            <h2>{username}</h2>
          </a>
          <p>{bio}</p>
        </div>
      </Flex>

      {type !== 'Organization' && (
        <Row>
          <Tooltip title="Go to user's followers" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
            <li className="link-li" onClick={() => window.open(`https://github.com/${username}?tab=followers`, '_blank')}>
              <PeopleIcon />
              <b>{kFormatter(followers)}</b>
              <span>followers</span>
              <span>·</span>
            </li>
          </Tooltip>

          <Tooltip title="Go to user's followings" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
            <li className="link-li" onClick={() => window.open(`https://github.com/${username}?tab=following`, '_blank')}>
              <b>{kFormatter(following)}</b>
              <span>following</span>
            </li>
          </Tooltip>
        </Row>
      )}

      <Column>
        {company && (
          <li>
            <CompanyIcon />
            <span>{company}</span>
          </li>
        )}
        {location && (
          <li>
            <LocationIcon />
            <span>{location}</span>
          </li>
        )}
        {email && (
          <li>
            <EmailIcon />
            <span>{email}</span>
          </li>
        )}
        {blog && (
          <li>
            <BlogIcon />
            <span>
              <Tooltip title="Go to user's blog" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                <a href={blog} target="_blank" rel="noopener noreferrer">
                  {blog}
                </a>
              </Tooltip>
            </span>
          </li>
        )}
        {twitter && (
          <li>
            <TwitterIcon />
            <span>
              <Tooltip title="Go to user's Twitter profile" placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer">
                  {`@${twitter}`}
                </a>
              </Tooltip>
            </span>
          </li>
        )}
      </Column>
      {orgs && orgs?.length > 0 && (
        <Organizations>
          <h5>Organizations</h5>
          <OrganizationsContainer>
            {orgs.map(org => (
              <OrganizationCard key={org?.login}>
                <Tooltip title={`Go to ${org.login}`} placement="bottom" arrow classes={{ tooltip: classes.tooltip }}>
                  <a href={`https://github.com/${org.login}`} target="_blank" rel="noopener noreferrer">
                    <img src={org?.avatar_url} alt={org.login} />
                  </a>
                </Tooltip>
              </OrganizationCard>
            ))}
          </OrganizationsContainer>
        </Organizations>
      )}
    </Container>
  );
};

export default ProfileData;
