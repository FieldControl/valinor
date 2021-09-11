import React from 'react';
import { GoRepo } from 'react-icons/go';
import { AiOutlineStar, AiOutlineEye } from 'react-icons/ai';
import { VscRepoForked } from 'react-icons/vsc';
import { Section, RepoList, ListItem, RepoIcon, RepoInfo } from './styles';

const ReposContainer = ({ repos }) => {
  return (
    <Section>
      <RepoList>
        {repos &&
          repos.map((repo) => {
            return (
              <ListItem key={repo.id}>
                <RepoIcon>
                  <GoRepo className="repo-icon" />
                </RepoIcon>
                <RepoInfo>
                  <div>
                    <p className="repo-name">{repo.name}</p>
                    <p>{repo.description}</p>
                  </div>
                  <div className="counts">
                    <span>
                      <VscRepoForked className="icon" /> {repo.forks}
                    </span>
                    <span>
                      <AiOutlineStar className="icon" /> {repo.stargazers_count}
                    </span>
                    <span>
                      <AiOutlineEye className="icon" /> {repo.watchers}
                    </span>
                  </div>
                </RepoInfo>
              </ListItem>
            );
          })}
      </RepoList>
    </Section>
  );
};

export default ReposContainer;
