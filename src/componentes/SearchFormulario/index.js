import { useLayoutEffect, useState } from "react";
import "./style.css";

import { MdClear } from "react-icons/md";

import { useNavigate, useParams } from "react-router-dom";

function SearchFormulario() {
    const navigate = useNavigate();

    const { searchText } = useParams();

    const [textoBusca, setTextoBusca] = useState("");

    function enviando() {
        if(textoBusca) {
            const buscaConvertida = encodeURIComponent(textoBusca);
            navigate(`/search/${buscaConvertida}`);
        }
        
    }

    useLayoutEffect(()=>{
        searchText && setTextoBusca(searchText);
    }, [searchText])

    return (
        <article className="formulario-area">
            <form 
                className="formulario-busca" 
                action=""
                method=""
                onSubmit={e=>{
                    e.preventDefault();
                    enviando();
                }}
            >
                <label className="label-pesquisa" htmlFor="texto-pesquisa">
                    <input 
                        id="texto-pesquisa"
                        type="text" 
                        placeholder="Faça uma busca" 
                        value={textoBusca}
                        onChange={e => setTextoBusca(e.target.value)}
                    />

                    {textoBusca &&
                        <div className="limpa-busca" onClick={()=>{
                            setTextoBusca("");
                        }}>
                            <MdClear />
                        </div>
                    }

                </label>
                
                <button>Buscar</button>
            </form>
        </article>
        
    )
};

export default SearchFormulario;