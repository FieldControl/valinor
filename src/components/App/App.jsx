import React, {useCallback, useState, useEffect} from "react";
import { Container, CssBaseline, Toolbar } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import Header from "../Header";
import RepoList from "../RepoList";
import darkTheme from "../../styles/Theme";
import { Pagination } from "@material-ui/lab";
import useStyles from "../../styles/Styles";
import * as api from '../../services/api';

const App = () => {
    const [page, setPage] = useState(1);
    const [ totalPages, setTotalPages ] = useState(0);
    const [ search, setSearch ] = useState('');
    const [ repos, setRepos ] = useState({});
    const classes = useStyles();
    
    const handleSearch = useCallback(async (search, page) => {
        const data = await api.query(search, 50, page);
        console.log(data);
        setRepos(data);
        setTotalPages(data.total_count > 1000 ? 20 : Math.floor(data.total_count / 50));
    }, []);

    useEffect(() => {
        if (search) {
            handleSearch(search, page);
        }
    }, [search, handleSearch, page])

    return(
        <ThemeProvider theme={darkTheme}>
            <Header doQuery={setSearch}/>
            <Toolbar />
            <Container maxWidth='lg' style={{marginTop: '15px'}}>
                <RepoList repositories={repos} />
                <div className={classes.pagination}>
                    <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} variant='outlined' shape='rounded'/>
                </div>
            </Container>
            <CssBaseline />
        </ThemeProvider>
    )
}

export default App;