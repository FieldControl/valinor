import { screen, render, fireEvent } from '@testing-library/react'

import { Header } from './index'

describe("Header Component", () => {
  test("deve renderizar o input dentro do header", () => {
    render(<Header />)

    const input = screen.getByPlaceholderText("Search or jump to...")

    expect(input).toBeInTheDocument()
  })

  test("deve conter o valor native dentro do input", () => {
    render(<Header />)

    const input = screen.getByPlaceholderText("Search or jump to...")

    fireEvent.change(input, {target: { value: "native" }})

    expect(input.value).toBe("native")
  })

})