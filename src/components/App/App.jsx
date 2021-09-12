import { Container, CssBaseline, Toolbar } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import React from "react";
import mockdata from "../../services/mockdata";
import Header from "../Header";
import RepoList from "../RepoList";
import darkTheme from "../../styles/Theme";

const data = mockdata;

const App = () => {
    return(
        <ThemeProvider theme={darkTheme}>
            <Header />
            <Toolbar />
            <Container maxWidth='lg' style={{marginTop: '10px'}}>
                <RepoList repositories={data.items} />
            </Container>
            <CssBaseline />
        </ThemeProvider>
    )
}

export default App;