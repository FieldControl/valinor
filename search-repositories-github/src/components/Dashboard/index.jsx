import { Header } from '../Header'
import { LeftMenu } from '../LeftMenu';

import { DashboardContainer, MainContent } from './styles'

/**
 * Componente Dashboard
 * contêm os outros componentes que aparecem em todas as páginas
 * @param {*} children componente filho a ser renderizado dentro do dashboard
 * @returns Dashboard React Component
 */
export function Dashboard({ children }) {
  return (
    <DashboardContainer>
      <Header />

      <MainContent>
        <LeftMenu />
        <section>
          {children}
        </section>
      </MainContent>
    </DashboardContainer>
  );
}