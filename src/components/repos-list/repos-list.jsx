import React, { useEffect, useContext, useState } from 'react';
import Emoji from 'react-emoji-render';
import { GoRepo } from 'react-icons/go';
import { AiOutlineStar, AiOutlineEye } from 'react-icons/ai';
import { VscRepoForked } from 'react-icons/vsc';
import Spinner from '../spinner/spinner';
import { context } from '../../context/data-provider';
import axios from 'axios';
import {
  Section,
  RepoListContainer,
  ListItem,
  RepoIcon,
  RepoInfo,
} from './styles';

export default function ReposList({ searchQuery }) {
  const value = useContext(context);
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [setTotalPages] = value.setTotalPages;
  const [currentPage] = value.currentPage;

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const { data } = await axios.get(
        `https://api.github.com/search/repositories?q=${searchQuery}&per_page=30&page=${currentPage}`
      );
      setRepos(data.items);
      setLoading(false);
      if (data.items.length < 30) {
        return;
      } else {
        //total de paginas
        setTotalPages(Math.ceil(data.total_count / data.items.length));
      }
    };

    fetchData();
  }, [currentPage, searchQuery, setTotalPages]);

  //k formatter
  const numFormatter = (num) => {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(1) + 'k';
    } else if (num > 1000000) {
      return (num / 1000000).toFixed(1) + 'm';
    } else if (num < 900) {
      return num;
    }
  };

  return (
    <Section>
      {loading ? (
        <Spinner />
      ) : (
        <RepoListContainer>
          {repos.map((repo, index) => (
            <ListItem data-testid={`repo-item-${index}`} key={repo.id}>
              <RepoIcon>
                <GoRepo className="repo-icon" />
              </RepoIcon>
              <RepoInfo>
                <div>
                  <a href={repo.clone_url}>
                    <p className="repo-name">{repo.full_name}</p>
                  </a>
                  <Emoji text={`${repo.description ? repo.description : ''}`} />
                </div>
                <div className="repo-status">
                  <span>
                    <VscRepoForked className="icon" />{' '}
                    {numFormatter(repo.forks)}
                  </span>
                  <span>
                    <AiOutlineStar className="icon" />
                    {numFormatter(repo.stargazers_count)}
                  </span>
                  <span>
                    <AiOutlineEye className="icon" />
                    {numFormatter(repo.watchers)}
                  </span>
                  <span>
                    <span
                      className={`language-color bg-color-${
                        repo.language && repo.language.toLowerCase()
                      }`}
                    ></span>
                    {repo.language}
                  </span>
                  <span>
                    <a href={`https://github.com/${repo.full_name}/issues`}>
                      {repo.open_issues} issues
                    </a>
                  </span>
                </div>
              </RepoInfo>
            </ListItem>
          ))}
        </RepoListContainer>
      )}
    </Section>
  );
}
