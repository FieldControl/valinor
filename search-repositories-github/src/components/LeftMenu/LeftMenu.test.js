import { screen, render } from '@testing-library/react'

import { LeftMenu } from './index'

describe("LeftMenu Component", () => {
  test("deve renderizar o span com o valor Repositories", () => {
    render(<LeftMenu />)

    const spanRepositories = screen.queryByText("Repositories")

    expect(spanRepositories).toBeInTheDocument()
  })

  test("deve renderizar o span com o valor Commits", () => {
    render(<LeftMenu />)

    const spanCommits = screen.queryByText("Repositories")

    expect(spanCommits).toBeInTheDocument()
  })

  test("deve renderizar o span com o valor Topics", () => {
    render(<LeftMenu />)

    const span = screen.queryByText("Topics")

    expect(span).toBeInTheDocument()
  })

})