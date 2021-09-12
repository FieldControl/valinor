import { createTheme } from "@material-ui/core";
import { lightBlue } from "@material-ui/core/colors";

const darkTheme = createTheme({
    palette: {
      type: 'dark',
      primary: lightBlue,
      secondary: {
        main: '#311b92',
      },
    },
  });

export default darkTheme;