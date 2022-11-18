import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import Series from "./series";
import { Container, Row } from "react-bootstrap";
import "../../style/style.css";
import {
    Pagination,
    PaginationButton,
    PaginationItem,
} from "../../style/style";

 // lista de series  a traves da API  e paginacao resumida//
const Serieslist = () => {

    const [state, setState] = useState([])
    const [updateState, setUpdateState] = useState([])
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState([20]);
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState([0]);


    useEffect(() => {
        async function loadSeries() {
            const response = await api.get(
                `/series?limit=6&offset=${currentPage}`);
            setTotal(response.data.data.total);
            setState(response.data.data.results)
            const totalPages = Math.ceil((total / 50) / limit);


            const arrayPages = [];
            for (let i = 1; i <= totalPages; i++) {
                arrayPages.push(i);
            }

            setPages(arrayPages);
            //setProducts(response.data.data.results);

            console.log(response.data);
        }

        loadSeries();

    }, [currentPage, limit, total]);

  

    return (
        <Container className="mb-5">
            <Row className="home" >
                {
                    state.map((series, id) => {
                        return (


                            <Series
                                key={id}
                                series={series}
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
export default Serieslist;