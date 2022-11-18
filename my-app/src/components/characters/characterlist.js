import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import CardCharacters from "./charactersCard"
import { Container, Row } from "react-bootstrap";
import "../../style/style.css";



// --  lista de personagens sendo criada traves da API --//

import {
  Pagination,
  PaginationButton,
  PaginationItem,
} from "../../style/style";

const Characterslist = () => {

  const [state, setState] = useState([])
  const [updateState, setUpdateState] = useState([])
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState([20]);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState([0]);

//--chamada dos personagems e limite de personagens a serem renderizados por página--//
  
useEffect(() => {
    async function loadCharacters() {
      const response = await api.get(
        `/characters?limit=6&offset=${currentPage}`);
      setTotal(response.data.data.total);
      setState(response.data.data.results)
      const totalPages = Math.ceil((total / 15) / limit);


      const arrayPages = [];
      for (let i = 1; i <= totalPages; i++) {
        arrayPages.push(i);
      }

      setPages(arrayPages);
      //setProducts(response.data.data.results);

      console.log(response.data);
    }

    loadCharacters();

  }, [currentPage, limit, total]);

 
  
  // mapeando os personagens e fazendo a paginacao--//
  return (
    <Container className="mb-5">
      <Row className="home" >
        {
          state.map((characters, id) => {
            return (


              <CardCharacters
                key={id}
                characters={characters}
                setUpdateState={setUpdateState}
                updateState={updateState}
              />

            )

          }
          )
        }


      </Row>
         
      <Pagination >
        <div>{total}</div>
        <PaginationButton>
          {currentPage > 1 && (
            <PaginationItem onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </PaginationItem>
          )}
          {pages.map((page) => (
            <PaginationItem
              isSelect={page === currentPage}
              key={page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PaginationItem>
          ))}
          {currentPage < pages.length && (
            <PaginationItem onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </PaginationItem>
          )}
        </PaginationButton>
      </Pagination>

    </Container>
  )
}
export default Characterslist;