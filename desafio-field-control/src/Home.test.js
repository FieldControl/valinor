
import { render, fireEvent, waitForEvent } from '@testing-library/react'
import Home from './pages/Home/index'
import '@testing-library/jest-dom/extend-expect';


test('Deveria ter input para insercao da linguagem',() => {
    const {getByTestId} = render(<Home/>)
    const inputElement = getByTestId('input')
    
    expect(inputElement).toBeInTheDocument()
}),

test('Clique no botão de pesquisa', () => {
    let chamarFuncaoPesquisa = false;
    const onClick= () => {
        chamarFuncaoPesquisa = true;
    }

    const {getByTestId} = render(<Home/>)
    const btnPesquisa = getByTestId('botao-pesquisa')

    fireEvent.click(btnPesquisa)
    expect(onClick).toBeTruthy()

})

test('Clique no botão de pagina anterior', () => {
    let chamarFuncaoPaginaAnterior = false;
    const onClick= () => {
        chamarFuncaoPaginaAnterior = true;
    }

    const {getByTestId} = render(<Home/>)
    const btnAnterior = getByTestId('pagina-anterior')

    fireEvent.click(btnAnterior)
    expect(onClick).toBeTruthy()

})

test('Clique no botão de pagina seguinte', () => {
    let chamarFuncaoPaginaSeguinte = false;
    const onClick= () => {
        chamarFuncaoPaginaSeguinte = true;
    }

    const {getByTestId} = render(<Home/>)
    const btnSeguinte = getByTestId('pagina-seguinte')

    fireEvent.click(btnSeguinte)
    expect(onClick).toBeTruthy()

})