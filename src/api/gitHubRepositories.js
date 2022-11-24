export default async function getRepositoriesByQueryAndPagination(params) {
  try {
    let response = await fetch(
      `https://api.github.com/search/repositories?q=${params.query}&page=${params.currentPage}&per_page=${params.pageSize}`
    );
    let result = await response.json();
    return result;
  } catch (error) {
    console.error("Could not get result from GitHub API", error);
    return error;
  }
}
