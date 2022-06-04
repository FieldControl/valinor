import styled from "styled-components";

export const StyledCard = styled.div`
    display: flex;
    align-items: center;
    background-color: #171515;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    margin: 40px 0;
    padding: 60px;
    border: #fff 2px solid;
    flex-direction: ${({layout}) => layout || 'row'};

    img {
        width: 80%;
    }

    & > div {
        flex: 1;
    }

    &:hover {
        box-shadow: 0 0 40px rgba(0, 0, 0, 1);
        transform: scale(0.99);
        cursor: pointer;
    }

    @media(max-width: ${({theme}) => theme.mobile}) {
        flex-direction: column;
    }
`