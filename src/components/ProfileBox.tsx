/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "../styles/components/ProfileBox.module.scss";

import "../assets/icomoon/style.css";
import { Link } from "react-router-dom";
import { useProfileContext } from "../context/ProfileContext";

export function ProfileBox() {
  const { profile, setProfile, gitHubUser, setGitHubUser } =
    useProfileContext();

  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const localStorageUserData = localStorage.getItem("@profileBox/gitHubUser");
    const localStorageUserProfile = localStorage.getItem("@profileBox/profile");

    setProfile(localStorageUserProfile || "");
    setGitHubUser(JSON.parse(localStorageUserData || "{}"));
  }, []);

  async function searchGitHubUser() {
    try {
      const { data } = await api.get("users/" + profile);

      localStorage.setItem("@profileBox/profile", profile);
      localStorage.setItem("@profileBox/gitHubUser", JSON.stringify(data));

      setGitHubUser(data);
      setErrorState(false);
    } catch {
      localStorage.removeItem("@profileBox/profile");
      localStorage.removeItem("@profileBox/gitHubUser");
      window.alert("Enter an existing user please!");
      setErrorState(true);
      setProfile("");
    }
  }

  function imagePath() {
    if (gitHubUser.avatar_url === undefined || errorState === true) {
      return "profile.svg";
    } else {
      return `https://avatars.githubusercontent.com/u/${gitHubUser.id}?v=4`;
    }
  }

  function textPath() {
    if (gitHubUser.name === undefined || errorState === true) {
      return "Search GitHub Profile.";
    } else if (gitHubUser.name === null) {
      return "This person has not registered their name.";
    } else {
      return gitHubUser.name;
    }
  }

  return (
    <div className={styles.profileBox}>
      <div className={styles.imageBox}>
        <p>{textPath()}</p>
        <img src={imagePath()} alt="Profile" loading="lazy" />
      </div>
      <div className={styles.searchBox}>
        <input
          type="text"
          value={profile}
          onChange={(event) => setProfile(event.target.value)}
          placeholder="Enter your GitHub profile"
        />
        <button onClick={searchGitHubUser}>Search</button>
      </div>
      <div className={styles.repoBox}>
        <div>
          <nav>
            <Link to={"/repos"}>
              <button>
                <i className="icon-content_paste" />
                <span> Repositories </span>
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
