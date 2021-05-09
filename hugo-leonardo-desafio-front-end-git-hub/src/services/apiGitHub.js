// BASE GITHUB API URLS
const REPOS_BASE_URL = 'https://api.github.com/search/repositories?q=';
const ISSUES_BASE_URL = 'https://api.github.com/search/issues?q=';

// CLIENT ID AND SECRET FROM GITHUB OAUTH APP
const CLIENT_ID = '&client_id=3ff6e9bf539fc9c40c0f';
const CLIENT_SECRET = '&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f';

// SORT QUERIES
const MOST_C = '&sort=comments';
const LEAST_C = '&sort=comments&order=asc';
const NEWEST = '&sort=created';
const OLDEST = '&sort=created&order=asc';
const RECENT = '&sort=updated&order=asc';
const LEAST = '&sort=updated&order=desc';
const MOST_S = '&sort=stars';
const FEW_S = '&sort=stars&order=asc';
const MOST_F = '&sort=forks';
const FEW_F = '&sort=forks&order=asc';

// PAGINATION

export const pagination = (newPage, isSelected) => {
  const lastReposUrl = JSON.parse(localStorage.getItem('reposBaseUrl'));
  const lastIssuesUrl = JSON.parse(localStorage.getItem('issuesBaseUrl'));
  let newUrl;
  if (isSelected) {
    newUrl = lastReposUrl.replace(/issues/, 'repositories');
    const newPageUrl = newUrl.replace(/page=\d+/, newPage);
    localStorage.setItem('reposBaseUrl', JSON.stringify(newPageUrl));
    return fetch(newPageUrl);
  }
  if (!isSelected) {
    newUrl = lastIssuesUrl.replace(/repositories/, 'issues');
    const newPageUrl = newUrl.replace(/page=\d+/, newPage);
    localStorage.setItem('issuesBaseUrl', JSON.stringify(newPageUrl));
    return fetch(newPageUrl);
  }
};

// REPOSITORIES

export const searchQuery = (query = '', page = '&page=1') => {
  const apiQuery = `${REPOS_BASE_URL}${query}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('reposBaseUrl', JSON.stringify(apiQuery));
  return fetch(apiQuery);
};

// REPOSITORIES SORT

export const mostStars = (query = '', page = '&page=1') => {
  const url = `${REPOS_BASE_URL}${query}${MOST_S}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('reposBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const fewestStars = (query = '', page = '&page=1') => {
  const url = `${REPOS_BASE_URL}${query}${FEW_S}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('reposBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const mostForks = (query = '', page = '&page=1') => {
  const url = `${REPOS_BASE_URL}${query}${MOST_F}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('reposBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const fewestForks = (query = '', page = '') => {
  const url = `${REPOS_BASE_URL}${query}${FEW_F}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('reposBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const repoRecentlyUp = (query = '', page = '') => {
  const url = `${REPOS_BASE_URL}${query}${RECENT}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('reposBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const repoLeastUp = (query = '', page = '') => {
  const url = `${REPOS_BASE_URL}${query}${LEAST}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('reposBaseUrl', JSON.stringify(url));
  return fetch(url);
};

// ISSUES

export const getIssues = (query = '', page = '&page=1') => {
  const apiQuery = `${ISSUES_BASE_URL}${query}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('issuesBaseUrl', JSON.stringify(apiQuery));
  return fetch(apiQuery);
};

// ISSUES SORT

export const mostCommented = (query = '', page = '&page=1') => {
  const url = `${ISSUES_BASE_URL}${query}${MOST_C}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('issuesBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const leastCommented = (query = '', page = '&page=1') => {
  const url = `${ISSUES_BASE_URL}${query}${LEAST_C}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('issuesBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const getNewest = (query = '', page = '&page=1') => {
  const url = `${ISSUES_BASE_URL}${query}${NEWEST}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('issuesBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const getOldest = (query = '', page = '') => {
  const url = `${ISSUES_BASE_URL}${query}${OLDEST}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('issuesBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const issueRecentlyUp = (query = '', page = '') => {
  const url = `${ISSUES_BASE_URL}${query}${RECENT}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('issuesBaseUrl', JSON.stringify(url));
  return fetch(url);
};

export const issueLeastUp = (query = '', page = '') => {
  const url = `${ISSUES_BASE_URL}${query}${LEAST}${page}${CLIENT_ID}${CLIENT_SECRET}`;
  localStorage.setItem('issuesBaseUrl', JSON.stringify(url));
  return fetch(url);
};
