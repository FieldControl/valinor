import { Grid, Paper, Typography } from '@material-ui/core';
import React from 'react';

const Repo = (props) => {
    const repository = props.repository;
    return(
        <Grid item xs={12}>
            <Paper >
                <Typography>{repository.name}</Typography>
            </Paper>
        </Grid>
    )
}

export default Repo;