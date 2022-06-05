//Seletores de ordem e itens por página

import React from "react";
import { Select } from "../../styles/styles";
import styled from "styled-components";

const Span = styled.span`
margin-left: 5px;
margin-right: 2px;
color: #8b9498;
`


const PaginationSelector = (props)=>{

    const setSort = (event)=>{
        const sortOrder = event.target.value.split(",")

        props.setSort({sort: sortOrder[0], order: sortOrder[1]})
    }

    return<div>
    <span>
        Exibição:
    </span>

    <Span>
        qtd/página
    </Span>
    <Select onChange={(event)=>props.setRepoPerPage(Number(event.target.value))}>
        <option value="5">5</option>
        <option selected value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
    </Select> 

    <Span>
        ordem
    </Span>
    <Select  onChange={setSort}>
        <option selected value={ ["best-match",  "desc"]}>best match (maior / menor)</option>
        <option  value={ ["best-match",  "asc"]}>best match (menor / maior)</option>
        
        <option  value={ ["stars",  "desc"]}>stars (maior / menor)</option>
        <option  value={ ["stars",  "asc"]}>stars (menor / maior)</option>
        
        <option  value={ ["forks",  "desc"]}>forks (maior / menor)</option>
        <option  value={ ["forks",  "asc"]}>forks (menor / maior)</option>
        
        <option  value={ ["help-wanted=issues",  "desc"]}>help wanted (maior / menor)</option>
        <option  value={ ["help-wanted=issues",  "asc"]}>help wanted (menor / maior)</option>
        
        <option  value={ ["updated",  "desc"]}>updated (maior / menor)</option>
        <option  value={ ["updated",  "asc"]}>updated (menor / maior)</option>
    </Select>
    </div> 

}

export default PaginationSelector