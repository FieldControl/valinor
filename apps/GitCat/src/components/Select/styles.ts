import styled from "styled-components";

export const Container = styled.details`
  position: relative;

  summary {
    height: 2rem;
    width: max-content;
    
    padding-inline: 1.5rem 2rem;
    border-radius: 0.3rem;
    border: 1px solid var(--btn-border);

    background: var(--select-bg);
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 600;
  }

  summary span {
    color: var(--gray)
  }

  summary::after {
    content: '';
    position: absolute;
    right: 1rem;
    width: 0;
    height: 0;
    border-left: 0.2rem solid transparent;
    border-right: 0.2rem solid transparent;
    border-top: 0.4rem solid black;
  }
`

export const Options = styled.div`
  position: absolute;
  z-index: 10;

  box-shadow: 0 0 15px rgba(0,0,0,0.05);
  width: 15rem;
  right: 0;

  && > p {
    border-radius: 0.3rem 0.3rem 0 0;
    border-top: 1px solid var(--btn-border);
    padding-inline: 1rem;
    font-weight: 600;
  }

  && > button:last-of-type {
    border-radius: 0 0 0.3rem 0.3rem;
  }

  && > * {
    width: 100%;
    height: 2rem;

    border: 0;
    border-radius: 0;
    
    display: flex;
    align-items: center;

    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--bg-header);
    background-color: var(--white);

    border-bottom: 1px solid var(--btn-border);
    border-inline: 1px solid var(--btn-border);

    /* transition: 0.5s background, color 0.5s; */
  }

  && > button {
    padding-inline: 2.5rem 1rem;
  }

  && > button:hover {
    background: var(--select-secundary);
    color: var(--white);
  }
`