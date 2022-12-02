import React from 'react';
import { render, screen} from '@testing-library/react'
import InputComponent from '../../components/InputComponent'


describe("Input Component", () => {
    test("shoulb be able to render an input", () => {
        render(<InputComponent placeholder="Digite aqui" />)

        expect(screen.getByPlaceholderText("Digite aqui")).toBeInTheDocument();
    })
})