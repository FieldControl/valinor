import Card from "./components/card/Card";
import Search from "./components/search/Search";
import { useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import Loading from "./components/loading/Loading";
import { numberWithCommas } from "./utils/numberWithComas";

var searchValue = "";
var sort = "order=desc&sort=";
var page = 0;
var pageCount = 0;
var total = 0;
var searched = false;
var tooManyResults = false;

const smallWindow = window.screen.width < 900;

function App() {
  const [repoData, setRepoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ulRef = useRef();

  function search(useSearchValue, resetPage = false) {
    if (!useSearchValue) return;
    if (resetPage) page = 0;

    searchValue = useSearchValue;
    setLoading(true);

    fetch(
      `https://api.github.com/search/repositories?q=${searchValue}&per_page=10&${sort}&page=${
        page + 1
      }`
    )
      .then((res) => res.json())
      .then((res) => {
        total = res.total_count;
        pageCount = Math.ceil(res.total_count / 10);
        searched = true;

        if (pageCount > 100) {
          pageCount = 100;
          tooManyResults = true;
        } else tooManyResults = false;

        setLoading(false);
        setRepoData(res.items);
      });
  }

  function handlePageClick(event) {
    page = event.selected;
    search(searchValue);
  }

  function liClicked(li, ulRef, useSort) {
    sort = useSort;

    let liNativeEvent = li.nativeEvent;
    let ulCurrent = ulRef.current;

    let lis = Array.from(ulCurrent.getElementsByTagName("li"));
    lis.map((li) => li.classList.remove("selected"));
    liNativeEvent.target.classList.add("selected");

    search(searchValue);
  }

  function Cards() {
    return (
      <>
        {!loading ? (
          <div className="cards-grid">
            {repoData.map((data) => (
              <Card key={data.id} values={data}></Card>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="root-grid">
        <div className="search-bar">
          <Search searchFn={search}></Search>
        </div>
        <div className="results">
          <h3>
            {searched ? (
              <span>
                {numberWithCommas(total)}{" "}
                {total > 1 ? "Resultados Encontrados" : "Resultado Encontrado"}
              </span>
            ) : (
              <span style={{ opacity: "0.3" }}>Esperando consulta</span>
            )}
          </h3>
          <hr></hr>
        </div>
        <div className="content-grid">
          {!smallWindow ? (
            <div className="sort">
              <ul ref={ulRef}>
                <div className="sort-title">
                  <i>Ordenações</i>
                </div>
                <li
                  onClick={(li) => liClicked(li, ulRef, "order=desc&sort=")}
                  className="selected"
                >
                  Melhor match
                </li>
                <hr></hr>
                <li
                  onClick={(li) =>
                    liClicked(li, ulRef, "order=desc&sort=stars")
                  }
                >
                  Mais estrelas
                </li>
                <hr></hr>
                <li
                  onClick={(li) => liClicked(li, ulRef, "order=asc&sort=stars")}
                >
                  Menas estrelas
                </li>
                <hr></hr>
                <li
                  onClick={(li) =>
                    liClicked(li, ulRef, "order=desc&sort=forks")
                  }
                >
                  Mais forks
                </li>
                <hr></hr>
                <li
                  onClick={(li) => liClicked(li, ulRef, "order=asc&sort=forks")}
                >
                  Menos forks
                </li>
              </ul>
            </div>
          ) : null}
          <div style={{ overflow: "auto" }}>
            <Loading loading={loading}></Loading>

            <Cards></Cards>
          </div>
        </div>
        {repoData.length && !loading ? (
          <>
            <div className="paginator">
              <ReactPaginate
                nextLabel="Próximo >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                previousLabel="< Anterior"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeClassName="active"
                renderOnZeroPageCount={null}
                forcePage={page}
              />
              {tooManyResults ? (
                <span className="too-many-results">
                  Apenas os 1000 primeiros resultados
                </span>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default App;
