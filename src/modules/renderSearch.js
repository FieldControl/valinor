import { handlePageSizeChange, handleGoToPage } from "./search.js";
import buildRepositoriesList from "./renderRepositories.js";

const pageFooter = document.querySelector("#wrapper > footer"); //impurity
const resultArea = document.getElementById("resultArea"); //impurity

export function renderResults(response, searchParameters) {
  const totalItens = response.total_count;
  if (totalItens > 0) {
    const lastAvailableItem = totalItens > 1000 ? 1000 : totalItens; // The github api only allows for the first 1000 itens to be fetched
    const pages = Math.ceil(lastAvailableItem / searchParameters.pageSize);
    const [...repositories] = response.items;

    const resultsDiv = document.createElement("div");
    resultsDiv.setAttribute("id", "resultsDiv");
    resultsDiv.appendChild(buildSearchResultsBar(totalItens, searchParameters));
    resultsDiv.appendChild(buildPageSizeSelector(totalItens, searchParameters));

    const repositoriesList = buildRepositoriesList(repositories);

    resultArea.innerHTML = "";
    resultArea.appendChild(resultsDiv);
    resultArea.appendChild(repositoriesList);

    pageFooter.innerHTML = "";
    if (totalItens > 10) {
      pageFooter.appendChild(buildPaginationList(pages, searchParameters));
    }
  } else {
    resultArea.innerHTML = "";
    resultArea.appendChild(renderZeroResults());
  }
}

function buildSearchResultsBar(totalItens, searchParameters) {
  const resultDiv = document.createElement("div");
  resultDiv.id = "resultMessage";
  const pageSize = searchParameters.pageSize;

  const firstItem = pageSize * (searchParameters.currentPage - 1) + 1;
  const lastItem =
    totalItens > pageSize ? firstItem - 1 + pageSize : totalItens;

  resultDiv.innerText = `Exibindo itens ${firstItem} a ${lastItem} de um total de ${totalItens}`;
  const showLimitedSearchMessage =
    totalItens > 1000 && firstItem - 1 == 1000 - pageSize;
  const limitedSearchMessage =
    "</br><span>A API de busca do GitHub só disponibiliza os 1000 primeiros resultados 😑</span>";
  resultDiv.innerHTML += showLimitedSearchMessage ? limitedSearchMessage : "";

  return resultDiv;
}

function buildPageSizeSelector(totalItens, searchParameters) {
  const div = document.createElement("div");
  div.setAttribute("id", "pageSize");
  const pageSize = searchParameters.pageSize;

  const label = document.createElement("label");
  label.setAttribute("for", "pageSize");
  label.innerText = "Exibir";
  div.appendChild(label);

  const select = document.createElement("select");
  select.setAttribute("name", "pageSize");
  select.classList.add("glowingControl");
  select.addEventListener("change", handlePageSizeChange);

  const opt10 = `<option value="10" ${
    pageSize == 10 ? "selected" : ""
  }>10</option>`;
  const opt50 = `<option value="50" ${
    pageSize == 50 ? "selected" : ""
  }>50</option>`;
  const opt100 = `<option value="100" ${
    pageSize == 100 ? "selected" : ""
  }>100</option>`;

  select.innerHTML = opt10 + opt50 + (totalItens > 50 ? opt100 : "");

  div.appendChild(select);
  return div;
}

function buildPaginationList(numberOfPages, searchParameters) {
  const list = document.createElement("ul");
  const currentPage = searchParameters.currentPage;

  const shouldRenderNavigateToFirst = currentPage > 1;

  list.appendChild(
    buildPaginationItem(
      "Ir para a primeira página",
      "«",
      1,
      !shouldRenderNavigateToFirst
    )
  );
  list.appendChild(
    buildPaginationItem(
      `Ir para a página anterior (${currentPage - 1})`,
      "Anterior",
      currentPage - 1,
      !shouldRenderNavigateToFirst
    )
  );

  let firstPageToList = 1;
  let lastPageToList = numberOfPages > 10 ? 10 : numberOfPages;
  if (
    numberOfPages > 10 &&
    currentPage > 5 &&
    currentPage < numberOfPages - 5
  ) {
    firstPageToList = currentPage - 5;
    lastPageToList = firstPageToList + 9;
  } else if (numberOfPages > 10 && currentPage > numberOfPages - 5) {
    firstPageToList = numberOfPages - 9;
    lastPageToList = numberOfPages;
  }
  for (let index = firstPageToList; index <= lastPageToList; index++) {
    const item = buildPaginationItem(
      `Ir para a página ${index}`,
      index,
      index,
      index == currentPage
    );
    if (index == currentPage) {
      item.classList.add("currentPage");
    }
    list.appendChild(item);
  }

  const shouldRenderNavigateToLast = currentPage < numberOfPages;

  list.appendChild(
    buildPaginationItem(
      `Ir para a próxima página (${currentPage + 1})`,
      "Próximo",
      currentPage + 1,
      !shouldRenderNavigateToLast
    )
  );
  list.appendChild(
    buildPaginationItem(
      `Ir para a última página (${numberOfPages})`,
      "»",
      numberOfPages,
      !shouldRenderNavigateToLast
    )
  );

  return list;
}

function buildPaginationItem(title, displayText, index, isDisabled = false) {
  const item = document.createElement("li");
  item.setAttribute("title", title);
  item.classList.add("paginationItem");

  const button = document.createElement("button");
  if (isDisabled) {
    button.setAttribute("disabled", "");
  } else {
    button.addEventListener("click", handleGoToPage);
    button.dataset["pageIndex"] = index;
  }
  button.innerText = displayText;
  button.classList.add("glowingControl");
  item.appendChild(button);
  return item;
}

function renderZeroResults() {
  const div = document.createElement("div");
  div.setAttribute("id", "zeroResultsDiv");
  const p = document.createElement("p");
  p.innerHTML =
    "Não foi possível encontrar resultados para a sua busca. Por favor, revise o termo buscado e tente novamente.";
  div.appendChild(p);
  return div;
}
