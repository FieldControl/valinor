// import { ReturnRepositories } from "./types/ReturnRepositories";

export const GetRepositories = (page: number, qtdPerPage: number = 10) => {
  return fetch(
    `https://api.github.com/search/repositories?q=bootstrap&page=${page}&per_page=${qtdPerPage}`
  )
    .then((response) => response)
    .then((response) => response.json())
    .catch((error) => error);
};
