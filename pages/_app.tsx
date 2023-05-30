import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import { theme } from '@/styles/confgStyle'

// para o nextui que é biblioteca que utilizei neste projeto funcionar devo adicionar o NextUIProvider na funcção App 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider theme={theme}>
      <Component {...pageProps} />
    </NextUIProvider>
  )
}
