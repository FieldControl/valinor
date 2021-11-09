import styled from 'styled-components'

export const HomeContainer = styled.main`
  padding: 0rem 0.25rem 0.25rem 0.25rem;
  width: 100%;
  height: 100%;

  @media(max-width: 800px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`

export const Pagination = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  margin: 1rem 0;

  strong + strong {
    margin-left: 0.5rem;
  }
`