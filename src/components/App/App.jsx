import React, {useCallback, useState, useEffect} from "react";
import { Container, CssBaseline, Toolbar, Typography } from "@material-ui/core";
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
    const [ loading, setLoading ] = useState(false);
    const [ newSearch, setNewSearch ] = useState(false);
    const classes = useStyles();
    
    const handleSearch = useCallback(async (search, page) => {
        setLoading(true);
        const data = await api.query(search, 50, page);
        setLoading(false);
        setRepos(data);
        setTotalPages(data.total_count > 1000 ? 20 : Math.floor(data.total_count / 50));
    }, []);

    useEffect(() => {
        if (search) {
            if (newSearch) {
                setPage(1); 
                setNewSearch(false);
            }; 
            handleSearch(search, page);
        }
    }, [search, handleSearch, page, newSearch])

    return(
        <ThemeProvider theme={darkTheme}>
            <Header doQuery={setSearch} loading={loading} newSearch={setNewSearch}/>
            <Toolbar />
            <Container maxWidth='lg' className={classes.repList}>
                {repos.items && (
                    <>
                    <RepoList repositories={repos} />
                    <div className={classes.pagination}>
                        <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} variant='outlined' shape='rounded'/>
                    </div>
                    </>
                )}
                {!repos.items && (
                    <Typography align='center' variant='h5'>Search for a repository!</Typography>
                )}
            </Container>
            <CssBaseline />
        </ThemeProvider>
    )
}

export default App;