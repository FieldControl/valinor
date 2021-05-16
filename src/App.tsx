import { Dashboard } from "./components/Dashboard"
import { Header } from "./components/Header"
import {GlobalStyle} from "./styles/global"
import {RepositoryProvider} from './hooks/useRepository';
import { Toast} from './components/Toast';


export const App: React.FC = () => {
  return (
  <RepositoryProvider>  
    <Header />
    <Dashboard />
    <Toast />
    

    <GlobalStyle/>
  </RepositoryProvider>
  )
}