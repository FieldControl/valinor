import {
  ReactNode,
  useEffect,
  createContext,
  useContext,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'

import routesTitles from '../utils/routesTitle'

interface Title {
  [key: string]: string
}

interface PageHeaderContextData {
  titles: Title
  title: string
  addToTitle: (text: string) => void
  changeTitle: (title: string) => void
  resetTitle: () => void
}

interface PageHeaderProviderProps {
  children: ReactNode
}

export const PageHeaderContext = createContext<PageHeaderContextData>(
  {} as PageHeaderContextData,
)

export function PageHeaderProvider({ children }: PageHeaderProviderProps) {
  const location = useLocation()

  const [baseTitles, setBaseTitles] = useState<Title>({} as Title)
  const [titles, setTitles] = useState<Title>({} as Title)
  const [title, setTitle] = useState('')

  useEffect(() => {
    setBaseTitles(routesTitles)
    setTitles(routesTitles)
  }, [])

  useEffect(() => {
    const pathnameSplitted = location.pathname.split('/')
    pathnameSplitted.shift()

    let pathname = ''

    pathnameSplitted.forEach((item) => {
      if (Number.isNaN(Number(item))) {
        pathname += item
      }
    })

    const newTitle = titles[pathname]

    if (newTitle) {
      setTitle(newTitle)
      document.title = `GitHub | ${newTitle}`
    }
  }, [location.pathname, titles])

  function addToTitle(text: string): void {
    const pathnameSplitted = location.pathname.split('/')
    pathnameSplitted.shift()

    let pathname = ''

    pathnameSplitted.forEach((item) => {
      if (Number.isNaN(Number(item))) {
        pathname += item
      }
    })

    setTitles({
      ...titles,
      [pathname]: `${titles[pathname]} - ${text}`,
    })

    document.title = `GitHub | ${titles[pathname]} - ${text}`
  }

  function changeTitle(name: string): void {
    setTitle(name)
    document.title = name
  }

  function resetTitle(): void {
    const pathnameSplitted = location.pathname.split('/')
    pathnameSplitted.shift()

    let pathname = ''

    pathnameSplitted.forEach((item) => {
      if (Number.isNaN(Number(item))) {
        pathname += item
      }
    })

    setTitles({
      ...titles,
      [pathname]: baseTitles[pathname],
    })

    document.title = `GitHub | ${baseTitles[pathname]}`
  }

  return (
    <PageHeaderContext.Provider
      value={{ titles, title, addToTitle, changeTitle, resetTitle }}
    >
      {children}
    </PageHeaderContext.Provider>
  )
}

export function usePageHeader(): PageHeaderContextData {
  const context = useContext(PageHeaderContext)

  if (!context) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider')
  }

  return context
}
