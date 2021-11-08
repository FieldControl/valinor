import styled from 'styled-components'

export const HomeContainer = styled.main`
  padding: 0rem 0.25rem 0.25rem 0.25rem;
  width: 100%;
  height: 100%;
`

export const RepositoryCard = styled.div`
  width: 100%;
  height: 10rem;
  padding: 1rem;
  border-radius: 1rem;
  
  display: flex;
  flex-direction: column;
  justify-content: left;
  background: #ccc;

  & + & {
    margin-top: 1rem;
  }

  header {
    p {
      margin: 0.5rem 0;
    }
  }


  h3, p {
    color: #000000;
  }

  button {
    padding: 0.2rem;
    border-radius: 0.5rem;
    border: none;
    
    & + button {
      margin-left: 0.25rem;
    }
  }

  button:hover {
    opacity: 0.5;
  }

  section:last-child {
    display: flex;
    justify-content: left;
    align-items: center;

    p + p {
      margin-left: 1rem;
    }
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