import styled from "styled-components";

export const Container = styled.div``;

/* ESTILOS DA PAGINACAO DE TODOS OS COMPONENTES LIST*/
export const Pagination = styled.div`
  display: flex;
  min-width: 500px;
  max-width: 900px;
  justify-content:space-between;
  margin-top: 10px;
  
`;


export const PaginationButton = styled.div`
  display: flex;
`;

export const PaginationItem = styled.div`
  margin: 0 10px;
  cursor: pointer;
  ${(props) =>
    props.isSelect && {
      background: "#6d6d6d",
      padding: "0 5px",
    }}
`;
