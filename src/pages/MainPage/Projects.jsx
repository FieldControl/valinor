import "./Projects.css";
import api from "./services/api";
import React, { useEffect, useState } from "react";

export default function Projects() {
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    api
      .get("/search/repositories?q=node")
      .then((res) => setRepositories(res.data))
      .catch((err) => {
        console.error("ops! ocorreu um erro" + err);
      });
  }, []);

  return (
    <>
      <h4>{repositories?.total_count} resultados, mostrando 10!</h4>
      <div className="contentProject">
        <a href={repositories?.items?.[0].svn_url} className="nameRepo">
          {repositories?.items?.[0].full_name}
        </a>
        <span>{repositories?.items?.[0].description}</span>
        <div>
          <span>{repositories?.items?.[0].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[1].svn_url} className="nameRepo">
          {repositories?.items?.[1].full_name}
        </a>
        <span>{repositories?.items?.[1].description}</span>
        <div>
          <span>{repositories?.items?.[1].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[2].svn_url} className="nameRepo">
          {repositories?.items?.[2].full_name}
        </a>
        <span>{repositories?.items?.[2].description}</span>
        <div>
          <span>{repositories?.items?.[2].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[3].svn_url} className="nameRepo">
          {repositories?.items?.[3].full_name}
        </a>
        <span>{repositories?.items?.[3].description}</span>
        <div>
          <span>{repositories?.items?.[3].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[4].svn_url} className="nameRepo">
          {repositories?.items?.[4].full_name}
        </a>
        <span>{repositories?.items?.[4].description}</span>
        <div>
          <span>{repositories?.items?.[4].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[5].svn_url} className="nameRepo">
          {repositories?.items?.[5].full_name}
        </a>
        <span>{repositories?.items?.[5].description}</span>
        <div>
          <span>{repositories?.items?.[5].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[6].svn_url} className="nameRepo">
          {repositories?.items?.[6].full_name}
        </a>
        <span>{repositories?.items?.[6].description}</span>
        <div>
          <span>{repositories?.items?.[6].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[7].svn_url} className="nameRepo">
          {repositories?.items?.[7].full_name}
        </a>
        <span>{repositories?.items?.[7].description}</span>
        <div>
          <span>{repositories?.items?.[7].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[8].svn_url} className="nameRepo">
          {repositories?.items?.[8].full_name}
        </a>
        <span>{repositories?.items?.[8].description}</span>
        <div>
          <span>{repositories?.items?.[8].language}</span>
        </div>
      </div>
      <div className="contentProject">
        <a href={repositories?.items?.[9].svn_url} className="nameRepo">
          {repositories?.items?.[9].full_name}
        </a>
        <span>{repositories?.items?.[9].description}</span>
        <div>
          <span>{repositories?.items?.[9].language}</span>
        </div>
      </div>
    </>
  );
}
