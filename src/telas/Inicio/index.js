import "./style.css";

import { VscGithubAlt } from "react-icons/vsc";

import SearchFormulario from "../../componentes/SearchFormulario";

function Inicio() {
    return (
        <section className="inicio">

            <div className="logo-grande">
                    <VscGithubAlt />
            </div>


            <SearchFormulario />
            
        </section>
    )
}

export default Inicio;