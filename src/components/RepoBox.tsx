/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useProfileContext } from "../context/ProfileContext";

import api from "../services/api";
import styles from "../styles/components/RepoBox.module.scss";
import FormatDate from "../Utils/FormatDate";

interface LicenseData {
  name?: string;
}
interface reposData {
  name: string;
  description: string;
  topics: string[];
  open_issues: string;
  stargazers_count: string;
  language: string;
  html_url: string;
  updated_at: string;
  license: LicenseData;
}

const RepoBox = () => {
  const { gitHubUser } = useProfileContext();
  const [repos, setRepos] = useState<reposData[]>([]);
  const [loading, setLoading] = useState(false);
  const [reposEmpty, setReposEmpty] = useState(false);

  const localStorageData = localStorage.getItem("@profileBox/profile");

  const history = useHistory();

  useEffect(() => {
    async function HandleGitRepos() {
      try {
        setLoading(true);
        const { data } = await api.get("users/" + localStorageData + "/repos");

        if (localStorageData !== null) {
          setRepos(data);
        }

        if (repos.length === 0) {
          setReposEmpty(true);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    HandleGitRepos();
  }, []);

  if (loading)
    return (
      <div className={styles.Loading}>
        <img src="Loading.png" alt="GitHub Image" />
        <h1>Loading...</h1>
      </div>
    );

  if (localStorageData === null) {
    history.push("/");

    window.alert("This person does not have a repository.");
  }

  return (
    <div className={styles.RepoContainer}>
      <div className={styles.boxProfile}>
        <img src={gitHubUser.avatar_url} alt="Foto de perfil" />
        <div className={styles.TextProfile}>
          <p>{gitHubUser.login}</p>
          <p>{gitHubUser.bio}</p>
          <a href={gitHubUser.html_url} rel="noreferrer" target="_blank">
            See GitHub Profile
          </a>
        </div>
      </div>

      {reposEmpty && (
        <h1>
          {repos.length === 0 && (
            <span className={styles.span}>
              This person does not have a repository!
            </span>
          )}
        </h1>
      )}

      <div className={styles.BoxRepos}>
        <div>
          {repos.map((repos) => {
            return (
              <div className={styles.Repos} key={repos.name}>
                <div className={styles.RepoName}>
                  <a href={repos.html_url} rel="noreferrer" target="_blank">
                    <div>{repos.name}</div>
                  </a>
                </div>

                <div className={styles.RepoDescriptions}>
                  {!repos.description
                    ? "The repository has no description"
                    : repos.description}
                </div>
                <div className={styles.RepoTopics}>
                  {repos.topics.map((topics) => (
                    <span key={topics}>{topics}</span>
                  ))}
                </div>
                <div className={styles.DescriptionBox}>
                  <div>
                    <img src="favorito.png" alt="star" />
                    {repos.stargazers_count}
                  </div>
                  <span>{repos.language}</span>
                  <span>{repos.license?.name}</span>
                  <span>Updated on {FormatDate(repos.updated_at)}</span>
                  <span>{repos.open_issues} issues needs help</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RepoBox;
