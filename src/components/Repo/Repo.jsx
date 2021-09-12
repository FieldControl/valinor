import { Grid, Card, Typography, CardContent, Box, Link } from '@material-ui/core';
import React from 'react';
import  {GoRepo} from 'react-icons/go';
import useStyles from '../../styles/Styles';
import colors from '../../styles/Colors';
import {BsFillCircleFill} from 'react-icons/bs';
import {MdStarBorder} from 'react-icons/md';
import TimeAgo from 'react-timeago';

const Repo = (props) => {
    const classes = useStyles();
    const repository = props.repository;
    
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
                        <Typography>
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
                        <Typography variant='body2'>
                            <Link target='_blank' href={`https://github.com/${repository.owner.login}/${repository.name}/stargazers`} className={classes.info} color='textPrimary'>
                                <MdStarBorder size={14}/>
                                {kFormatter(repository.stargazers_count)}
                            </Link>
                        </Typography>
                    {repository.language && (
                        <Box className={classes.info}>
                        <Typography variant='caption' style={{marginLeft: '5px', display: 'flex', alignItems: 'center'}}>
                        <BsFillCircleFill size={12} color={colors[repository.language].color} style={{marginRight: '5px'}}/> {repository.language}
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
                </div>
                </CardContent>
            </Card>
        </Grid>
    )
}

export default Repo;