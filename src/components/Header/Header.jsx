import React, {useState} from 'react';
import { AppBar, Box, Toolbar, Typography, InputBase, LinearProgress } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { FaGithubAlt } from 'react-icons/fa';
import useStyles from '../../styles/Styles';

const Header = (props) => {
    const classes = useStyles();
    const [query, setQuery] = useState('');
    const loading = props.loading;

    const handlePesquisa = (e) => {
        if (e.keyCode === 13) {
            props.doQuery(query);
            props.newSearch(true);
            setQuery('');
        }
    }

    return(
        <AppBar color='secondary'>
            <Toolbar className={classes.nav}>
                <Box className={classes.logo}>
                    <FaGithubAlt size={32}/>
                    <Typography variant='h6' style={{marginLeft: '10px'}}>GitRepos</Typography>
                </Box>
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                    <SearchIcon />
                    </div>
                    <InputBase
                    placeholder='Find repository...'
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={(e) => setQuery(e.target.value)}
                    value={query}
                    onKeyUp={handlePesquisa}
                    />
                </div>
            </Toolbar>
            {loading && (
                <div className={classes.loading}>
                    <LinearProgress color='primary'/>
                </div>
            )}
        </AppBar>
    )
}

export default Header;