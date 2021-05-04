import React, { Component } from "react";
import "./Home.scss";
import Search from "../../components/Search/Search";
import { withRouter } from "react-router-dom";
import RepoCard from "./RepoCard/RepoCard";

class Home extends Component {
  state = {
    repos: [],
    search: "",
    submit: false,
    pageCounter: 0,
    totalCount: 0,
  };
  /* eslint-disable  react/prop-types */

  componentDidUpdate() {
    const { submit } = this.state;
    if (submit) {
      this.fetchRepos();
    }
  }
  fetchRepos = async () => {
    const { search } = this.state;
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${search}&page=1&per_page=10`
      );
      const data = await response.json();
      this.setState({
        repos: data.items,
        submit: false,
        totalCount: data.total_count,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        repos: [],
        submit: false,
      });
    }
  };
  searchField = (e) => {
    this.setState({ search: e.target.value });
  };
  submitSearch = () => {
    const { search } = this.state;
    if (search.length) {
      this.setState({ submit: true });
    }
  };

  render() {
    const { search, repos, totalCount } = this.state;
    let name = "";
    if (repos.length) {
      name = (
        <ul className="home__container">
          <h3 className="home__total__count">
            {" "}
            {totalCount} repository results
          </h3>

          {repos.map((repo, index) => {
            return <RepoCard key={index} {...repo} />;
          })}
        </ul>
      );
    }
    return (
      <div className="home">
        <div className="home__search">
          <Search change={(e) => this.searchField(e)} text={search} />
          <button className="home__button" onClick={() => this.submitSearch()}>
            {" "}
            Search
          </button>
        </div>

        {name}
      </div>
    );
  }
}

export default withRouter(Home);
