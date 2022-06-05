import React from "react";
import { Select } from "../../styles/styles";



const PaginationSelector = (props)=>{


    return<>
    Exibição:
    <Select onChange={(event)=>props.setRepoPerPage(Number(event.target.value))}>
        <option value="5">5</option>
        <option selected value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
    </Select> 
    </> 

}

export default PaginationSelector