import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../styles/theme'
import { RepositoryProvider } from './RepositoryProvider';


export const AppProvider = ({children}) => (
    <RepositoryProvider>
        <ChakraProvider theme={theme}>{children}
        </ChakraProvider>
    </RepositoryProvider>
    
)