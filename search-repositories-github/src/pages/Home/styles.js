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

export const RepositoryCard = styled.div`
  width: 100%;
  min-height: 10rem;
  padding: 1rem;
  border-radius: 1rem;
  
  display: flex;
  flex-direction: column;
  justify-content: left;
  background: var(--card-color-primary);

  & + & {
    margin-top: 1rem;
  }

  header {
    a {
      text-decoration: none;
      color: var(--font-color-primary);
    }

    a:hover {
      text-decoration: underline;
    }

    p {
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0.5rem 0;
    }
  }


  h3, p {
    color: var(--font-color-primary);
  }

  button {
    margin: 0.2rem 0;
    padding: 0.26rem;
    border-radius: 0.5rem;
    border: none;
    margin-left: 0.25rem;
    background: var(--card-topics-color-primary);
    color: #FDFAF6;
    font-weight: 500;
  }

  button:hover {
    opacity: 0.9;
  }

  section:last-child {
    display: flex;
    justify-content: left;
    align-items: center;
    font-size: 0.8rem;

    p {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    p + p {
      margin-left: 1rem;
    }
  }

  section p.watchers {
    svg {
      margin-right: 0.25rem;
    }

    display: flex;
    align-items: center;
    justify-content: center;
  }


  @media(max-width: 800px) {
    width: 90%;
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