import styled from "styled-components"

export const Container = styled.form`
    width: 100%;
    max-width: 30rem;
    height: 2rem;
    background: var(--white);

    display: flex;

    padding-left: 1rem;
    border-radius: 1rem;
    overflow: hidden;
`

export const Input = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.75rem;
    margin-right: 1rem;
`

export const Button = styled.button`
    width: 2.5rem;
    border-radius: 0;
    outline: none;

    display: flex;
    justify-content: center;
    align-items: center;

    background: transparent;
    border: none;
    border-left: 1px solid var(--btn-border);
    background: var(----btn-secondary);

    svg {
        width: 100%;
        height: 50%;
    }
`