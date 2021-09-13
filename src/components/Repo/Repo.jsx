import React from 'react';
import { Grid, Card, Typography, CardContent, Box, Link } from '@material-ui/core';
import  {GoRepo} from 'react-icons/go';
import useStyles from '../../styles/Styles';
import colors from '../../styles/Colors';
import {BsFillCircleFill, BsStar} from 'react-icons/bs';
import TimeAgo from 'react-timeago';

const Repo = (props) => {
    const classes = useStyles();
    const repository = props.repository;
    console.log(repository.language, colors[repository.language]);
    
    let desc = repository.description ? repository.description : '';
    if (desc.length > 120) {
        desc = desc.substring(0,120)+'...';
    }

    function kFormatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
    }

    return(
        <Grid item xs={12}>
            <Card variant='outlined'>
                <CardContent>
                    <Box className={classes.title}>
                        <Typography color='textSecondary'>
                            <GoRepo display='flex'/>
                        </Typography>
                        <Typography style={{marginLeft: '10px'}}>
                            <Link target='_blank' variant='body2' href={repository.html_url} className={classes.link}>
                            {repository.full_name}
                            </Link>
                        </Typography>
                    </Box>
                <Typography variant='body2' className={classes.description}>
                    {desc}
                </Typography>
                <div className={classes.infoBox}>
                        <Typography variant='caption' className={classes.info}>
                            <Link target='_blank' href={`https://github.com/${repository.owner.login}/${repository.name}/stargazers`} color='textPrimary' underline='none' className={classes.infoLink}>
                                <BsStar size={12} style={{marginRight: '3px'}}/>
                                {kFormatter(repository.stargazers_count)}
                            </Link>
                        </Typography>
                    {repository.language && (
                        <Box className={classes.info}>
                        <Typography variant='caption'>
                        <BsFillCircleFill size={12} color={colors[repository.language].color} style={{marginRight: '3px'}}/> {repository.language}
                        </Typography>
                    </Box>
                    )}
                    {repository.license && (
                        <Box className={classes.info}>
                            <Typography variant='caption' color='textSecondary'>{repository.license.name}</Typography>
                        </Box>
                    )}
                    <Box className={classes.info}>
                        <Typography variant='caption' color='textSecondary'>Updated <TimeAgo date={repository.updated_at}/></Typography>
                    </Box>
                    {(repository.has_issues && repository.open_issues_count > 0) && (
                        <Box className={classes.info}>
                        <Typography variant='caption' color='textSecondary'>
                            <Link target='_blank' href={`https://github.com/${repository.owner.login}/${repository.name}/issues`}color='textSecondary' underline='none' className={classes.infoLink}>
                                {repository.open_issues_count} open issues
                            </Link>
                        </Typography>
                    </Box>
                    )}
                    
                </div>
                </CardContent>
            </Card>
        </Grid>
    )
}

export default Repo;