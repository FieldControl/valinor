import getRepos from "../api/gitHubRepositories.js";
import { renderResults } from "./renderSearch.js";
import {
  getSearchParameters,
  setSearchParameters,
} from "./searchParameters.js";

export async function search(parameters) {
  const response = await getRepos(parameters);
  return response;
}

export function handleSearchClick() {
  const queryInput = document.getElementById("queryInput").value.trim();

  if (queryInput !== "") {
    setSearchParameters("query", queryInput);
    setSearchParameters("currentPage", "0");
    const searchParameters = getSearchParameters();

    search(searchParameters).then((response) =>
      renderResults(response, searchParameters)
    );
  }
}

export function handlePageSizeChange() {
  setSearchParameters("pageSize", this.value);
  setSearchParameters("currentPage", "0");
  const searchParameters = getSearchParameters();

  search(searchParameters).then((response) =>
    renderResults(response, searchParameters)
  );
}

export function handleGoToPage() {
  setSearchParameters("currentPage", this.dataset.pageIndex);
  const searchParameters = getSearchParameters();

  search(searchParameters).then((response) =>
    renderResults(response, searchParameters)
  );
}
