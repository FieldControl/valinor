import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "@material-ui/lab/Pagination";
import { LinearProgress, CircularProgress } from "@material-ui/core/";

import "./app.css";

function App() {
  const [data, setData] = useState("node");
  const [api, setApi] = useState();
  const [pag, setPage] = useState(1);

  const handleChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        `https://api.github.com/search/repositories?q=${data}&page=${pag}`
      );
      console.log(result.data);
      setApi(result.data);
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [data, pag]);

  return (
    <div className="grid grid-template-areas-1">
      <div className="nav">
        <img src={process.env.PUBLIC_URL + "/github.png"} alt="icon-github" />
        <input
          id="search"
          placeholder="Search or junmp to..."
          value={data}
          onChange={(e) => setData(e.currentTarget.value)}
        />
      </div>
      <div className="content">
        {api ? (
          <h2>{api.total_count} repository results</h2>
        ) : (
          <CircularProgress />
        )}
        <ul>
          {api ? (
            api.items.map((x) => (
              <li key={x.id}>
                <a href={`https://github.com/${x.full_name}`}>
                  <p style={{ display: "flex" }}>
                    <img src={process.env.PUBLIC_URL + "12.png"} />{" "}
                    {x.full_name}
                  </p>
                </a>

                <p className="lip">{x.description}</p>
                <div className="lip list-itens">
                  <a href="https://github.com/nodejs/node/stargazers">
                    <p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-star"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                      </svg>
                      {x.stargazers_count}
                    </p>
                  </a>
                  <p>{x.language}</p>
                  <p>{x.license ? x.license.key : "none"} license </p>
                  <a href={`https://github.com/${x.full_name}/issues`}>
                    <p> {x.open_issues_count} open issues </p>
                  </a>
                </div>
              </li>
            ))
          ) : (
            <LinearProgress />
          )}
        </ul>
        <div style={{ color: "white" }}>
          {api ? (
            <Pagination
              className="pag"
              color="primary"
              variant="outlined"
              shape="rounded"
              count={30}
              page={pag}
              onChange={handleChange}
            />
          ) : (
            <CircularProgress />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
