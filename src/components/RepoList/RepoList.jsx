import { Grid, Typography } from '@material-ui/core';
import React from 'react';
import Repo from '../Repo';

const RepoList = (props) => {
    const repos = props.repositories.items;
    const result = props.repositories.total_count;
    return(
        <Grid container spacing={2}>
            {result > 0 && repos.map(repository => (
                <Repo repository={repository} key={repository.id}/>
            ))}
            {result === 0 && (
                <Grid item xs={12}>
                    <Typography align='center'>Nothing found</Typography>
                </Grid>
            )}
        </Grid>
    )
}

export default RepoList;