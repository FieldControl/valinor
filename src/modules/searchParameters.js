export function setSearchParameters(key, value) {
  sessionStorage.setItem(key, validateSearchParameter(key, value));
}

function validateSearchParameter(key, value) {
  switch (key) {
    case "query":
      return value;
    case "currentPage":
      if (typeof Number(value) != "number" || value < 1) return 1;
      else return Math.floor(value);
    case "pageSize":
      if (typeof Number(value) != "number" || value < 1) return 10;
      else return Math.floor(value);
    default:
      console.error(`Couldn't find query parameter ${key}`);
      return undefined;
  }
}

export function createSearchParameters() {
  setSearchParameters("query", " ");
  setSearchParameters("currentPage", "1");
  setSearchParameters("pageSize", "10");
}

export function getSearchParameters() {
  return {
    query: sessionStorage.getItem("query"),
    currentPage: Number(sessionStorage.getItem("currentPage")),
    pageSize: Number(sessionStorage.getItem("pageSize")),
  };
}
