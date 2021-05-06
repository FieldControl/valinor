import React, { Component } from "react";
import "./Home.scss";
import Search from "../../components/Search/Search";
import { withRouter } from "react-router-dom";
import RepoCard from "./RepoCard/RepoCard";
import IssueCard from "./IssueCard/IssueCard";

import { formatNumberWithComma } from "../../helpers/format";

class Home extends Component {
  state = {
    repos: [],
    search: "",
    submit: false,
    pageCounter: 0,
    totalCount: 0,
    type: "repositories",
    issues: [],
  };
  /* eslint-disable  react/prop-types */

  componentDidUpdate(prevProps, prevState) {
    const { submit } = this.state;
    console.log(prevProps);
    console.log(prevState);

    if (submit) {
      this.fetchRepos();
    }
  }
  fetchRepos = async () => {
    const { search, type } = this.state;
    try {
      const response = await fetch(
        `https://api.github.com/search/${type}?q=${search}&page=1&per_page=10`
      );
      const data = await response.json();
      if (type === "issues") {
        this.setState({
          issues: data.items,
          submit: false,
          totalCount: data.total_count,
        });
      }
      if (type === "repositories") {
        this.setState({
          repos: data.items,
          submit: false,
          totalCount: data.total_count,
        });
      }
    } catch (err) {
      console.log(err);
      this.setState({
        repos: [],
        issues: [],
        submit: false,
      });
    }
  };
  searchField = (e) => {
    this.setState({ search: e.target.value });
  };
  searchType = (e) => {
    this.setState({ type: e.target.value });
  };
  submitSearch = () => {
    const { search, type } = this.state;
    if (search.length && type.length) {
      this.setState({ submit: true });
    }
  };

  render() {
    const { search, type, issues, repos, totalCount } = this.state;
    let name = "";
    if (repos.length || issues.length) {
      name = (
        <ul className="home__container">
          <h3 className="home__total__count">
            {" "}
            {formatNumberWithComma(totalCount)} {`${type} results`}
          </h3>

          {type === "repositories"
            ? repos.map((repo, index) => {
                return <RepoCard key={index} {...repo} />;
              })
            : null}

          {type === "issues"
            ? issues.map((issue, index) => {
                return <IssueCard key={index} {...issue} />;
              })
            : null}
        </ul>
      );
    }
    return (
      <>
        <div className="home">
          <div className="home__search">
            <Search
              change={(e) => this.searchField(e)}
              text={search}
              changeType={(e) => this.searchType(e)}
              type={type}
              click={() => this.submitSearch()}
            />
            <button
              className="home__button"
              onClick={() => this.submitSearch()}
            >
              {" "}
              Search
            </button>
          </div>

          {name}
        </div>
      </>
    );
  }
}

export default withRouter(Home);
