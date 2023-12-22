import { render } from "@testing-library/react"
import Header from "./components/Header"

describe('Jest', () => {
    it.skip('should be true', () => {
        expect(1+2).toBe(8)
    })

    it('should display elements', () => {
        render(<Header/>)
    })
})