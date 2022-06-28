import styled from "styled-components";

export const Ul = styled.ul`
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    height: 50px;
    width: 60%;
    gap: .1rem;   
`;

export const BtnArrows = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    background: none;
    font-size: 18px;
    padding: .2rem;
    width: 40px;
    cursor: pointer;

    &:hover {
        color: #303030;
        border: 1px solid #bebebe;
        border-radius: 4px;
    };
`;

interface Focus {
    page?: number,
    currentPage?: number
};

export const BtnPages = styled.button<Focus>`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    background: ${props => props.page === props.currentPage ? '#1f6feb' : 'none'};
    color: ${props => props.page === props.currentPage ? '#ffffff' : 'none'};
    border-radius: ${props => props.page === props.currentPage ? '4px' : 'none'};
    font-size: 18px;
    padding: .2rem;
    width: 40px;
    cursor: pointer;

    &:hover {
        color: ${props => props.page === props.currentPage ? '#ffffff' : 'none'};
        border: ${props => props.page === props.currentPage ? '1px solid transparent' : '1px solid #bebebe'};
        border-radius: 4px;
    };
`;