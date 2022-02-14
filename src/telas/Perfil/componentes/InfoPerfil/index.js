import "./style.css";

import { useSelector } from "react-redux";

export default function InfoPerfil() {

    const { dataRepo } = useSelector(state=>state.perfilData);
    return (
        <article className="info-basica-perfil">  
            <img 
                className="imagem-usuario-repositorio" 
                src={dataRepo.owner.avatar_url} 
                alt="imagem de perfil"
            />

            <p className="nome-usuario">
                {dataRepo.owner.login}
            </p>
        </article>
    );
};