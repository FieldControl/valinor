import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../../services/api";

export const RepoContext = React.createContext({});

export const RepositoryProvider = ({ children }) => {
  const [inputValue, setInputValue] = useState("node");
  const [repo, setRepo] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [topics, setTopics] = useState([]);
  const [page, setPage] = useState(1);

  const getRepo = async (page) => {
    await axios
      .get(`${url}repositories?q=${inputValue}&per_page=10&page=${page}`)
      .then((res) => {
        setRepo(res.data.items);
        setTotalCount(res.data.total_count);
        getTopics()
      })
      .catch((err) => console.log(err));
  };
  useEffect(()=>{
  }, [repo])

  const previousPage = () => {
    if (page >= 1) {
      setPage(page - 1);
      getRepo(page);
    }
  };
  const nextPage = () => {
    if (page < 100) {
      setPage(page + 1);
      getRepo(page);
    }
  };

  const getTopics = async () => {
    await axios
      .get(`${url}topics?q=${inputValue}&per_page=8`)
      .then((res) => {
        setTopics(res.data.items);
      })
      .catch((err) => console.log(err));
      console.log(topics)
  };

  return (
    <RepoContext.Provider
      value={{
        inputValue,
        setInputValue,
        repo,
        getRepo,
        useRepo,
        totalCount,
        page,
        previousPage,
        nextPage,
        getTopics,
        topics,
        setTopics
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => React.useContext(RepoContext);
