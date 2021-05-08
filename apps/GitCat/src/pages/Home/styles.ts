import styled from "styled-components";
import {ReactComponent as logo} from '../../assets/images/logoName.svg'

import {margin} from '../../styles/patters'

export const Container = styled.div`
    background: var(--bg-header);
    width: 100%;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
`

export const Main = styled.main`
    ${margin}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

export const Logo = styled(logo)`
    width: 20rem;
    height: min-content;
    margin-bottom: 3rem;
    path {
        fill: var(--white);
    }
`