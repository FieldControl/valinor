import styled from "styled-components";
import {margin} from '../../styles/patters'

export const Content = styled.div`
  ${margin}
  margin-block: 1.5rem;
  display: flex;
`

export const SideMenu = styled.aside`
  width: 15rem;
  flex-shrink: 0;
`

export const Main = styled.main`
  margin-left: 2rem;
  width: 100%;

  header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
  }

  header h1 {
    font-size: 1.25rem;
    font-weight: 600;
  }

  footer {
    width: 100%;
  }
`