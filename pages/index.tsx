"use client" // por padrão no nextjs 13 cada página por padrão é habilitado com o Server Side Render, o use cliente garante que não vamos usar o servidor padrão do nextjs para carregar os dados da spa
import { useState,useEffect } from 'react' // variavel do react
import { useForm } from 'react-hook-form' // formulario
import { api, apiUser } from '@/lib/axios' // endpoint da api
import Image from 'next/image'
import Busca from '../public/busca.jpg'

// componentes
import { Grid, Input, Loading, Pagination } from '@nextui-org/react'
import { ErrorSearch } from '@/components/ErrorSearch/ErrorSearch'
import { CardItem } from '@/components/CardItem/CardItem'
import { SendButton } from '@/components/SendButton/SendButton'
import { Loading as LoadingComponent } from "@/components/Loading/Loading"

// icones
import { MagnifyingGlass } from '@phosphor-icons/react'

// tipagens
interface CardItemProps {
  id: string
  owner: {
    avatar_url: string
  }
  full_name: string
  description: string
  topics: string[] | []
  language: string
  html_url: string
  name: string

  // card props user, dados dos usuarios
  login: string | null
  avatar_url: string | null
  url: string | null
}

// interface CardItemUserProps {
//   login: string
//   id: string
//   avatar_url: string
//   url: string
//   html_url: string
// }

interface FormProps {
  search: string
}

export default function Home() {

  const { handleSubmit, register } = useForm<FormProps>() // para usar o react hook forms devemos buscar as duas funções basica para o formulário
  // o handleSubmit serve para utilizar no evendo de submit do formulário
  // o register é para definir o "name" do input 

  // estados definidor
  const [isError, setIsError] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const [listResult, setListResult] = useState<CardItemProps[]>([]) // onde vai ficar os dados
  const [page,setPage] = useState<number>(1)
  const [totalItens, setTotalItens] = useState<number>(0)

  // envia a requisição para a API do github
  async function HandleSearchApi(data: FormProps) {
    setLoading(true)
    try {
      setIsError(false)
      setSearch(data.search) // adiciono nesse state para facilitar na paginação

      if(data.search.includes('@')) {

        const result = await apiUser.get(`users?q=${data.search.split('@')[1]}`) // pesquisa o usuario
        setTotalItens(
          result.data.total_count <= 1000 ? result.data.total_count :
            1000
        ) // na API do github temos limite de dados para consultar
        setListResult(result.data.items)

      }else {

        const result = await api.get(`${data.search}`) // pesquisa o repositório
        setTotalItens(
          result.data.total_count <= 1000 ? result.data.total_count :
            1000
        ) // na API do github temos limite de dados para consultar
        setListResult(result.data.items)

      }

      setPage(1) // atualiza o state para mudar na a indicação da pagina
    } catch (error) {
      setIsError(true) // caso ocorra algum erro na solicitação
    }

    setLoading(false)
  }

  // para listar mais repositórios do github, opitei por fazer outra solicitação para a API novamente mesmo sabendo do bloqueio por varias requisições em um unico ip
  // montei deste modo porque na minha opinião 30 registros é pouco interessante
  async function handleSearchApiPage(search: string, page: number) {
    setLoading(true)

    try {
      setIsError(false)

      if(search.includes('@')) {
        const result = await apiUser.get(`users?q=${search.split('@')[1]}&page=${page}`) // pesquisa o usuario
        setListResult(result.data.items)

      }else {
        const result = await api.get(`${search}&page=${page}`) // pesquisa um repositório
        setListResult(result.data.items)
      }

      setPage(page)// atualiza o state para mudar na a indicação da pagina
    } catch (error) {
      setIsError(true)
    }

    setLoading(false)
  }

  return (
    <main>
      <div className="flex justify-center">
        <Image
          className="w-[500px] h-[300px] rounded-full"
          width={500}
          height={300}
          src={Busca}
          alt={"imagem"}
          quality={100}
        />
      </div>

      <form
        onSubmit={handleSubmit(HandleSearchApi)}
        className="mx-4 mb-4 flex justify-center"
      >
        {loading === true ? (
          <div className="w-[800px] max-md:w-[90%]">
            <Input
              aria-label="Buscando..." //para acessbilidade
              className="h-[60px]"
              fullWidth
              shadow={false}
              status="primary"
              disabled
              bordered
              animated={true}
              color="primary"
              placeholder="Loading..."
              contentRight={<Loading size="xs" />}
            />
          </div>
        ) : (
          <div className="w-[800px] max-md:w-[90%]">
            <Input
              aria-label="Digite algo para pesquisar repositórios do github" //para acessbilidade
              {...register("search", { required: true })}
              className="h-[60px]"
              fullWidth
              shadow={false}
              status="primary"
              animated={true}
              clearable
              contentRightStyling={false}
              placeholder="Pesquise por um repositório"
              contentRight={
                <SendButton key={2}>
                  <MagnifyingGlass className="text-black" />
                </SendButton>
              }
            />
          </div>
        )}
      </form>
      <h2 className="text-center text-orange-600 font-bold mb-4 px-2">Para pesquisar um perfil de usuário coloque um @ em frente ao nome de usuário</h2>

      {loading === true ? (
        <div className="w-full py-40">
          <LoadingComponent />
        </div>
      ) : isError === true ? (
        <ErrorSearch />
      ) : (
        <div className="flex flex-wrap justify-around max-md:block">
          {listResult.length == 0 ? (
            <div></div>
          ) : (
            listResult.map((element: CardItemProps) => (
              <CardItem key={element.id} props={element} />
            ))
          )}
        </div>
      )}

      <div className="flex justify-center my-10">
        {loading === true ? null : isError === true ? null : listResult.length >
          0 ? (
          <Pagination
            shadow
            noMargin
            total={
              totalItens / 30 > Math.round(totalItens / 30)
                ? Math.round(totalItens / 30) + 1
                : Math.round(totalItens / 30)
            }
            page={page}
            initialPage={1}
            onChange={(page: number) => {
              handleSearchApiPage(search, page);
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
