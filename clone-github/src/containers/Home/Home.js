import React, { Component } from "react";
import "./Home.scss";
import Search from "../../components/Search/Search";
import { withRouter } from "react-router-dom";
import RepoCard from "./RepoCard/RepoCard";
import IssueCard from "./IssueCard/IssueCard";
import Paginator from "../../components/Paginator/Paginator";

import { formatNumberWithComma } from "../../helpers/format";

class Home extends Component {
  state = {
    repos: [],
    search: "",
    submit: false,
    pageCounter: 1,
    totalCount: 0,
    type: "repositories",
    issues: [],
    links: [],
  };
  /* eslint-disable  react/prop-types */

  componentDidUpdate(prevProps) {
    const { submit } = this.state;
    const { page } = this.props.location;

    if (submit) {
      this.fetchRepos();
    }
    if (prevProps.location.page !== page) {
      this.setState({ submit: true });
      window.scrollTo(0, 0);
    }
  }
  componentWillUnmount() {
    this.fetchRepos();
    window.scrollTo(0, 0);
    this.props.history.replace({ location: { page: 1 } });
  }

  fetchRepos = async () => {
    const { search, type } = this.state;
    const { page } = this.props.location;
    try {
      const response = await fetch(
        `https://api.github.com/search/${type}?q=${search}&page=${
          page ? page : "1"
        }&per_page=10`
      );
      const data = await response.json();

      const arr = this.getLinksOfHeader(response);

      if (type === "issues") {
        this.setState({
          issues: data.items,
          submit: false,
          totalCount: data.total_count,
          pageCounter: page,
          links: arr,
        });
      }
      if (type === "repositories") {
        this.setState({
          repos: data.items,
          submit: false,
          totalCount: data.total_count,
          pageCounter: page,
          links: arr,
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
    this.props.history.replace({ location: { page: 1 } });
    const { search, type } = this.state;
    if (search.length && type.length) {
      this.setState({ submit: true });
    }
  };
  getLinksOfHeader = (header) => {
    const { page } = this.props.location;
    const link = header.headers.get("link");
    let re = link.split(",");
    let arr = [];
    arr.push({ rel: "page", page: page || 1 });

    for (let i = 0; i <= re.length; i++) {
      if (re[i]) {
        arr.push(this.regexLink(re[i]));
      }
    }
    return arr;
  };
  regexLink = (link) => {
    let l = link.replace(/;/gim, "&");
    let p = l.replace(/<|>/gim, "");
    let g = p.replace(/ /gim, "");
    let a = new URLSearchParams(g);
    let rel = String(a.get("rel")).replace(/"/gim, "");
    let page = String(a.get("page")).replace(/ /gim, "");
    return { rel: rel, page: page };
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
          <Paginator links={this.state.links} />
        </ul>
      );
    }

    return (
      <div className="home">
        <div className="home__search">
          <Search
            change={(e) => this.searchField(e)}
            text={search}
            changeType={(e) => this.searchType(e)}
            type={type}
            click={() => this.submitSearch()}
          />
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
