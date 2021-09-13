import { alpha, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    
  },
  pagination: {
    '& > *': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(3)
    },
    display: 'flex',
    justifyContent: 'center'
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  navbar: {
      backgroundColor: '#161B22',
      color: '#fff'
  },
  nav: {
      flexDirection: 'row',
      [theme.breakpoints.down('xs')]: {
          flexDirection: 'column',
          padding: '10px'
      }
  },
  logo: {
      display: 'flex',
      flexGrow: 1,
      alignItems: 'center',
      [theme.breakpoints.down('xs')] : {
          marginBottom: '10px'
      }
  },
  title: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
  },
  repList: {
      marginTop: '15px',
      [theme.breakpoints.down('xs')]: {
          marginTop: '60px'
      }
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: 'auto',
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(1),
      width: '100%',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '28ch',
      },
    },
  },
  link: {
    fontWeight: 'bold'
  },
  description: {
    paddingLeft: '24px'
  },
  infoBox : {
    display: 'flex',
    alignItems: 'center',
    marginTop: '15px',
    paddingLeft: '24px'
  },
  info : {
      display: 'flex',
      alignItems: 'center',
      marginRight: '15px'
  },
  infoLink: {
      '&:hover': {
          color: '#189FED'
      }
  },
  loading: {
      width: '100%',
      position: 'absolute',
      zIndex: 99,
      top: 0,
      left: 0,
      right: 0
  }
}));

export default useStyles;