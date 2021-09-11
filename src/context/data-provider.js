import React, { createContext, useState } from 'react';

export const context = createContext();

export const ContextProvider = (props) => {
  const [repos, setRepos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const value = {
    repos: [repos],
    setRepos: [setRepos],
    currentPage: [currentPage],
    setCurrentPage: [setCurrentPage],
  };

  return <context.Provider value={value}>{props.children}</context.Provider>;
};
