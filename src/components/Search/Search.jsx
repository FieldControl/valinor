import { useEffect, useRef, useState, useContext} from 'react';
import { ModoContext } from '../../context/ModoContext';//importando o context

import url_default from '../../axios/axios'; //importando url padrao

import star from '../../assets/star.png';
import book from '../../assets/book.png';
import loading from '../../assets/loading.gif'; //importando imagens
import './Search.css';

const Search = ()  => {

    const { backgroundSearch, colorInput, colorInputTxt, colorDados, filterInvert } = useContext(ModoContext);

    const sleep = ms => new Promise(res => setTimeout(res, ms)); //configuração padrão para o sleep
    
    const [ qtd, setQtd ] = useState(0); //Quantidade de repositório total.

    const [ qtd_max, setQtd_Max ] = useState(0); //Quantidade maxima conforme a documentação informa.
    
    const [ dados, setDados ] = useState([]); //usestate recebe um array.

    const [ pag, setPag ] = useState(1); //pagina principal que está focada/utlizando.
    
    const [ pag_range_first, setPage_Range_First ] = useState(1);//primeiro número da paginação

    const [ pag_range_end, setPage_Range_End ] = useState(7);//ultimo número da paginação

    const [ marq, setMarq ] = useState(0);//para tirar voltar a cor do botão ao padrão quando selecionar outro

    const repos = useRef('');//nome do repositório

    const [ ordem, setOrdem ]= useState('');//filtro por strelas. Pode ser outros ditos na documentação.

    const [ ascdesc, setAscDesc ]= useState('');//order de exibição das estrelas, descrecente ou crescente.

    const [ dad_id, setDad_id ] = useState(``);//Exibir gif de carregamento.

    const [ ord_id, setOrd_id ] = useState('');//Exibir o select.

    const [ dados_id, setDados_id ] = useState('');//Exibir os dados

    const [ paginate_id, setPaginate_id ] = useState('');//exibir a paginação

    const [ qtd_id, setQtd_id ] = useState('');//exibir a quantidade

    const getdados = async () => { // funcao assincrona
        try { 
            const resposta = await url_default.get(repos.current+`&per_page=10&page=${pag}&sort=${ordem}&order=${ascdesc}`); //tentando fazer a requisição.

            //Armazenando os dados em constantes
            const dado = resposta.data.items;
            const quant =  resposta.data.total_count;

            //Passando a quantidade de repositórios
            setQtd(quant);

            //Limitando a quantidade pois o maximo é 1000 repositórios que a API trás
            if(quant > 1000){
                setQtd_Max(1000)
            }
            else {
                setQtd_Max(quant);
            }

            if(repos.current == '')return//faz com que se a repos for igual a vazio, ela pare o codigo

            //Verificando tem repositório digitado.
            if(dado.length <= 1){
                
                //mostrando o gif de loading
                setDad_id(<img id='loading' src={loading} alt='Carregando'></img>);

                //ocultando os itens
                setOrd_id(`none`);

                setDados_id(`none`);

                setPaginate_id(`none`);

                setQtd_id(`none`);

                await sleep(3000);//espera a quantideda de tento descrito para continuar a execução.

                setDad_id(`Repositório não encontrado! Tente novamente.`);
            }
            else {

                //ocultando os itens
                setOrd_id(`none`);

                setDados_id(`none`);

                setPaginate_id(`none`);

                setQtd_id(`none`);

                //passando os dados
                setDados(dado);

                //exibindo gif loading
                setDad_id(<img id='loading' src={loading} alt='Carregando'></img>);

                //espera a quantideda de tento descrito para continuar a execução.
                await sleep(3000);

                //ocultando o tem
                setDad_id(``);

                //exibindo os itens
                setDados_id(`block`);

                setOrd_id(`block`);

                setPaginate_id(`block`);

                setQtd_id(`block`);
            };
            
        } catch(error) {
            console.log(error);//se houver um erro entra nesse catch e exite o erro

            if( repos != '') { 
                alert("Há algo de errado com a API. Recarregue a página. Se não funcionar tente em alguns minutos ou entre em contato com os desenvolvedores @erick_gbs ! Tente novamente em alguns minutos. "+error);
            };//alerta para o usuário.
        }
    };
    var last = paginas().length //guardando o valor maximo

    function paginas() {

        let pages = [];//array para a paginação
        
        //adicionando na primeira posição do array uma função/número
        let a = 0;
        pages.unshift(
            <a href="#header" key={a.toString()} >
                <button onClick={ first_page } id='0'>First</button>
            </a>
        );

        //adicionando no array a quantidade de número de paginás que terá
        for (let i = 2; i < (qtd_max/10); i++){
            pages.push(
            <a href="#header" key={i.toString()}>
                <button type="button" id={i.toString()} onClick={()=>any_page(i)}>{i}</button>
            </a>
            );
        };

        //adicionando na última posição do array uma função/número
        pages.push(
            <a  key={last_page}>
                <button onClick={ last_page } id={last}>Last</button>
            </a>
        );
        return pages;
    };
    
    //função para definir quais botão vão aparecer na paginação ao se clicado
    function first_page() {
        setPag(1);
        setPage_Range_First(1);
        setPage_Range_End(7);
        any_page(0);
    };
    
    function last_page() {
        setPag(last);
        setPage_Range_First(paginas().length - 10);
        setPage_Range_End(paginas().length - 1);
        any_page(paginas().length);
        return last;
    };
    
    //função recebdno o indece do for e passando como id
    function any_page(id) {
        
        //mudar a cor de fundo do botão se estiver focado e voltar ao normal quando outro tiver sido clicado
        let reset = document.getElementById(marq);
        let foco = document.getElementById(id);

        //passando o id para saber qual vai ser desmarcado depois
        setMarq(id);

        //veficação
        if(id == pag) return

        //verifição
        if(id == "btn"){
            setPag(1) //Quando clicar em "buscar" a pagina vai para a primeira.)

            reset.style.background = "#fff";
            reset.style.color = "black";
            reset.style.border = "1px solid black";
            
            foco.style.background = "black";
            foco.style.color = "white";
        }
        else {
            reset.style.background = "#fff";
            reset.style.color = "black";
            reset.style.border = "1px solid black";
            
            foco.style.background = "black";
            foco.style.color = "white";
            setPag(id);
        }

        //verificação para setar os botoés da paginação
        if(id >= 1){
            
            if(id < paginas().length - 4){
                if(id >= 7) {
                    setPage_Range_First(id - 3);
                    setPage_Range_End(parseInt(id) + 2);
                }
                else {
                    setPage_Range_First(1);
                    setPage_Range_End(7);
                }
            }
            else {
                setPage_Range_First(parseInt(id) - 6);
                setPage_Range_End(paginas().length - 1);
            }
        }
        else {
            setPage_Range_First(1);
        }
    }
       
    //verificação para saber qual a order dos items será exibida
    function Order() {
        var resposta = document.getElementById("order_select")
        var resposta = resposta.value

        switch(resposta) {
            case 'star_desc':
                setOrdem('stars');
                setAscDesc('desc');
                break;
            case 'star_asc':
                setOrdem('stars');
                setAscDesc('asc');
                break;
            case '':
                break;
        }
        
    };

    //hook para cada modificação em pag, ele chame a funcao getdados;
    useEffect(() => {
        getdados();
    },[pag]);

return (
    <div className='search' style={{background: backgroundSearch}}>
        <div id='container_form'>

            <form onSubmit={(e) => {e.preventDefault()}}>

                <input  style={{background: colorInput, color: colorInputTxt}}
                        type='text' 
                        id='repository' 
                        placeholder='Digite Aqui' 
                        onChange={(e) => repos.current = e.target.value}
                />
                <button type='submit' 
                        id='btn' 
                        value='buscar' 
                        onClick={getdados} className="material-icons">
                        search
                        </button>
            </form>
            <div id='qtd_order' >
                <div id='qtd' style={{display: qtd_id}}>
                    <h2 style={{filter: filterInvert}}>Quantidade de repositórios: {qtd.toLocaleString()}</h2> {/* tolocalestring faz com que o número tenha pontos para diferenciar de dezena, centena e etc... */}
                </div>
                <div id="order" style={{display: ord_id}}>
                    <select id='order_select' onChange={Order} >
                        <option value={""}>Ordem</option>
                        <option value={"star_desc"}>Estrelas(maior)</option>
                        <option value={"star_asc"}>Estrelas(menor)</option>
                    </select>
                </div>
        </div>
        </div>
        <div id='dad'>
            {dad_id}
        </div>
        <div id='dados' style={{display: dados_id}}>
            {(dados.map((dados) => (
                <div key={dados.id} className='dados' style={{backgroundImage: colorDados}}>
                    <h2 className='repository_img'>
                        <a href={dados.svn_url} target='_blank'>
                            <img src={ book }></img>
                            {dados.name}
                        </a>
                    </h2>
                    <p className='description'>Descrição: {dados.description}</p>
                    <p className='language'>Linguagem: {dados.language}</p>
                    <div className='container_star'>
                        <a href={`https://github.com/${dados.full_name}/stargazers`} target='_blank'>
                            <img src={ star }></img>
                            <p className='star'>{dados.stargazers_count.toLocaleString()}</p>
                        </a>
                        <p>Última Atualização: {dados.updated_at.replace("-", "/").replace("-", "/").substring(0, 10).split('/').reverse().join('/')}</p>
                    </div>
                </div>
            )))}
        </div>
        <div id='paginate' style={{display: paginate_id}}>
            
            <ul id='list_paginate'>
                {paginas().slice(0, 1)}{/* slice para mostrar de um x item até o y item do array */}
                {paginas().slice( pag_range_first, pag_range_end )}
                {paginas().slice(paginas().length-1 , paginas().length)}
            </ul>
            
        </div>
    </div>
)
};

export default Search;