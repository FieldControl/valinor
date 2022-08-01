import styled from 'styled-components'

export const Container = styled.div`

`
export const Titulo = styled.h1`
    text-align: center;
    margin: 1rem 0;
`

export const DivInput = styled.div`
display: flex;
flex-direction: row;
justify-content: center;
margin: 3rem;
`

export const Input = styled.input`
min-width: 10rem;
height: 2rem;
padding: 0.2rem;
border: none;
border-radius: 0.5rem;
`

export const Button = styled.button`
min-width: 6rem ;
min-height: 2rem; ;
margin-left: 2rem;
color:#57A6FF;
background-color: rgba(125, 149, 199, 0.4);
border: none;
border-radius: 0.5rem;
cursor: pointer;
`

export const ListaRepo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center ;
`

export const ContainerLinguagem = styled.div`
    border: none;
    border-radius: 1rem;
    padding: 1rem ;
    margin: 2rem 0 2rem 0; 
    color:#57A6FF;
    background-color: rgba(125, 149, 199, 0.4);

`

export const ContainerDescricao = styled.div`

`

export const ContainerLista = styled.div ` 
    border-top: 1px solid #30363A;
    padding: 1rem;
    width: 90%;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    margin-top: 1rem;

    a{
        color: #fff;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: flex-start;

    }
    h2{
        font-size: 1.2rem;
        color: #57A6FF;
    }

`
export const RepositorioImg = styled.div`
margin-top: 0.3rem;
`
export const Informacoes = styled.div`
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    margin-left: 1rem;

`

export const ParagrafosDesc = styled.div`
    margin: 0.5rem;
`

export const TopicosLinha = styled.div`
    display: flex;
    flex-direction: row;
    margin-left: 0.5rem;
    flex-wrap: wrap;
`

export const Topicos = styled.div`
    margin: 0.5rem 0.5rem 0.5rem 0;
    border-radius: 1rem;
    padding: 0.3rem 0.4rem;
    background-color: rgba(125, 149, 199, 0.4);

    &:hover{
        background-color: #57A6FF;

        p{
            color: #fff;
        }
    }

    p{
        color:#57A6FF;
        font-size: 0.8rem;
    }
`

export const LinhaInfos = styled.div`
    display: flex ;
    align-items: flex-start;
    flex-direction: row;
`

export const ParagrafosInfo = styled.div`
    margin: 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    
    div{
        margin-right: 1rem;
        display: flex;
        align-items: center;
    }
    p{
        margin-left: 0.5rem;
    }
`

export const ContadorPaginacao = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

`