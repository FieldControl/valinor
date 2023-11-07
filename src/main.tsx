import ReactDOM from 'react-dom/client'

import { Provider } from '@siakit/core'
import { DialogProvider } from '@siakit/dialog'
import { LoadingProvider } from '@siakit/loading'
import { ToastProvider } from '@siakit/toast'

import { App } from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider>
    <ToastProvider>
      <DialogProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </DialogProvider>
    </ToastProvider>
  </Provider>,
)
