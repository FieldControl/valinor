import { extendTheme, theme as ChakraTheme } from '@chakra-ui/react'

export const theme = extendTheme({
    colors: {
        blue: {
            500: '#ddf4ff',
            600: '#70bff5',
            700: '#0969da'
        },
        gray: {
            300: '#f6f8fa',
            400: '#d4d4d4',
            700: '#6e7781',
            900: '#24292f'
        },
        red: {
            600: '#df1545'
        },
        green: {
            600: '#168821'
        },
        fonts: {
            headings:'Inter',
            body: 'Inter'
        },
        fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            32: '8rem',
        },
        styles: {
            global: {
                bg: 'white',
                color: 'gray.400'
            }
        }
    }
})