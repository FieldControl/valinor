import React, { Component, Suspense } from "react";
import "./Home.scss";
import Search from "../../components/Search/Search";
import { withRouter } from "react-router-dom";
import { formatNumberWithComma } from "../../helpers/format";
import PropTypes from "prop-types";

const AsyncPaginator = React.lazy(() =>
  import("../../components/Paginator/Paginator")
);
const AsyncRepoCard = React.lazy(() => import("./RepoCard/RepoCard"));
const AsyncIssueCard = React.lazy(() => import("./IssueCard/IssueCard"));

/**
 * Container  Home. 
 *
 * @class
 * @example
 * 
 * <Home>
 
 */

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
    this.props.history.replace({ location: { page: 1 } });
  }
  /**
   * @async
   * @function  fetchRepos
   * @property  {string}  search   value of search
   * @property  {number}  page  property of history.location
   * @property  {string}  type   value of search of select tag
   * @return {Promise<Array>} The data from URL
   */
  fetchRepos = async () => {
    const { search, type } = this.state;
    const { page } = this.props.location;
    try {
      const response = await fetch(
        `https://api.github.com/search/${type}?order="desc"&q=${search}&page=${
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
  /**
   * Return a array of links
   * @function  getLinksOfHeader
   * @param {string}  header  link of header
   * @property  {string}  page  property of history.location
   * @return {Array} array of links
   *
   * @example
   * this.getLinksOfHeader(`<https://api.github.com/search/repositories?order="desc"&q=ss&page=2&per_page=10>; rel="next",
   * <https://api.github.com/search/repositories?order="desc"&q=ss&page=100&per_page=10>; rel="last"`)
   * [
   *  <https://api.github.com/search/repositories?order="desc"&q=ss&page=2&per_page=10>; rel="next",
   *  <https://api.github.com/search/repositories?order="desc"&q=ss&page=100&per_page=10>; rel="last"
   * ]
   *
   */
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
  /**
   * Regex for clean a string
   *
   * @function  regexLink
   * @param {array} link  array of links
   * @property  {number}  page  property of history.location
   * @return {Object} Return a Object
   *
   * @example
   * this.regexLink(<https://api.github.com/search/repositories?order="desc"&q=ss&page=100&per_page=10>; rel="last")
   * { rel: "last", page: 10 };
   *
   */

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
                return (
                  <Suspense key={index} fallback={<div>Loading...</div>}>
                    <AsyncRepoCard {...repo} />
                  </Suspense>
                );
              })
            : null}

          {type === "issues"
            ? issues.map((issue, index) => {
                return (
                  <Suspense key={index} fallback={<div>Loading...</div>}>
                    <AsyncIssueCard key={index} {...issue} />
                  </Suspense>
                );
              })
            : null}
          <Suspense fallback={<div>Loading...</div>}>
            <AsyncPaginator links={this.state.links} />
          </Suspense>
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
        {repos.length || search.length ? null : (
          <h1 className="home__title">Search a repository in github.</h1>
        )}
        {name}
      </div>
    );
  }
}

Home.propTypes = {
  page: PropTypes.number,
  location: PropTypes.object,
  history: PropTypes.object,
};
export default withRouter(Home);
