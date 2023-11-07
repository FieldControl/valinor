import { BrowserRouter } from 'react-router-dom'

import { Flex } from '@siakit/layout'
import { Separator } from '@siakit/separator'

import { PageHeader } from './components/PageHeader'
import { Sidebar } from './components/SideBar'
import { PageHeaderProvider } from './hook/pageHeader'
import { Router } from './routes/Router'

export function App() {
  return (
    <BrowserRouter>
      <PageHeaderProvider>
        <Flex flex overflow direction="column">
          <PageHeader />
          <Separator css={{ margin: 0 }} />
          <Flex flex overflow>
            <Flex maxWidth={296} flex>
              <Sidebar />
            </Flex>
            <Flex flex>
              <Router />
            </Flex>
          </Flex>
        </Flex>
      </PageHeaderProvider>
    </BrowserRouter>
  )
}
