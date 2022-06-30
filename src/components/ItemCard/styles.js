import styled from "styled-components";

export const ContainerRepository = styled.div`
    max-width:100%;
    border-radius:8px;
    padding:24px;
    background-color: #DDD;
    margin:16px;
    flex-direction:center;
    align-items:center;
    border: 0.5px groove gray;
    
    &:hover {
        cursor: pointer;
        box-shadow: 0 0 15px rgba(0, 0, 0, 1);
        transform: scale(0.98);
    }
`

export const StarsInRepository = styled.h2`
    float:right;
    font-weight:700;
    color:yellow;
`
