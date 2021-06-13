import React, { useEffect, useState } from "react";
import "./app.css";
import axios from "axios";
import { CircularProgress } from "@material-ui/core/";
import Pagination from "@material-ui/lab/Pagination";



function App() {
  const [data, setData] = useState("javascript");
  const [page, setPage] = useState(1);
  const [api, setApi] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const fetchData = async () => {
      const pesquisa = await axios(
        `https://api.github.com/search/repositories?q=${data}&page=${page}`
      );
      setApi(pesquisa.data);
    };
    fetchData();
  }, [data, page]);

  const handleChange = (event, value) => {
    window.scrollTo(0, 0);
    setPage(value);
  };

  return (
    <div>
      <div className="main-header">
        <div className="inner">
          <h1 className="main-title">GitHub Search</h1>
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              type="search"
              value={data}
              onChange={(e) => setData(e.currentTarget.value)}
              name="Pesquisar"
              placeholder="Pesquisar"
            />
          </form>
        </div>
      </div>
      <div className="main-content">
        {api ? (
          <h2>{api.total_count} repository results</h2>
        ) : (
          <CircularProgress />
        )}
        <ul>
          {api ? (
            api.items.map((props) => (
              <li key={props.id}>
                <a href={`https://github.com/${props.full_name}`}>
                  <p>{props.full_name}</p>
                </a>

                <p className="lip">{props.description}</p>
                <div>
                  <a href="https://github.com/airbnb/javascript/stargazers">
                    <p>
                      <img src="https://visualpharm.com/assets/400/Star-595b40b85ba036ed117da787.svg"/>
                      {props.stargazers_count}
                    </p>
                    </a>
                  <p>{props.language}</p>
                  <p>{props.license ? props.license.key : "none"} license </p>
                  <a href={`https://github.com/${props.full_name}/issues`}>
                    <p> 
                      <img src="https://www.nicepng.com/png/full/301-3016911_issues-management-green-risk-icon-png.png"/>
                      {props.open_issues_count} Open Issues </p>
                    <p> 
                      <img src="https://www.seekpng.com/png/full/399-3998655_big-image-date-picker-icon-png.png" />
                      {props.updated_at} Last Update</p>
                  </a>
                </div>
              </li>
            ))
          ) : (
            <p></p>
          )}
        </ul>
        <div>
          {api ? (
            <Pagination
              color="secondary"
              variant="outlined"
              shape="rounded"
              count={10}
              page={page}
              onChange={handleChange}
            />
          ) : (
            <h2></h2>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
