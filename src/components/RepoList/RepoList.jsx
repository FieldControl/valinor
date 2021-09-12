import { Grid } from '@material-ui/core';
import React from 'react';
import Repo from '../Repo';

const RepoList = (props) => {
    const repos = props.repositories;
    return(
        <Grid container>
            {repos.map(repository => (
                <Repo repository={repository} key={repository.id}/>
            ))}
        </Grid>
    )
}

export default RepoList;