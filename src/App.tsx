import { Dashboard } from "./components/Dashboard"
import { Header } from "./components/Header"
import {GlobalStyle} from "./styles/global"
import {RepositoryProvider} from './hooks/useRepository';

export const App: React.FC = () => {
  return (
  <RepositoryProvider>  
    <Header />
    <Dashboard />

    <GlobalStyle/>
  </RepositoryProvider>
  )
}