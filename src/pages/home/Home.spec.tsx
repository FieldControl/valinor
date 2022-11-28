import { render} from '@testing-library/react'
import {Home} from './Home'

//Verificando se aparece a caixa de pesquisa com o titulo.
describe('Home search', () => {
    it('should render home search', () => {
        const {getByText} = render(<Home />)

        expect(getByText('Github Search Repository')).toBeInTheDocument()
    })
})
//Iria verificar se o GET com a query acessaria a API mas não consegui fazer
//um teste dar certo :\

//Teste de verificação de avanço e retorno de paginação
//Click no link do repositorio para o destino no GITHUB