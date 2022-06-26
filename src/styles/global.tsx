import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        outline: 0;
        box-sizing: border-box;
        font-family: 'Roboto';
    };

    input {
        border: none;
        border-radius: 2px;
        width: 60%;
        height: 1.5rem;
        box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
        padding: 0 1rem;
    };

    a, a:hover, a:focus, a:active {
      text-decoration: none;
      color: inherit;
    };
`;