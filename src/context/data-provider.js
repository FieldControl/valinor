import React, { createContext, useState } from 'react';

export const context = createContext();

export const ContextProvider = (props) => {
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const value = {
    totalPages: [totalPages],
    setTotalPages: [setTotalPages],
    currentPage: [currentPage],
    setCurrentPage: [setCurrentPage],
  };

  return <context.Provider value={value}>{props.children}</context.Provider>;
};
