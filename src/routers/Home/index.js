import React from "react";
import "./style.css";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormularioPesquisa from "../../components/FormularioPesquisa";



function Home() {

    return (
        <section className="home">
            <div className="area-central">

                <div className="mensagem-inicial">
                    <span>
                        <FontAwesomeIcon icon={faSearch} />
                    </span>

                    <p>
                        Busque por repositórios
                    </p>
                </div>
                

                <FormularioPesquisa />

            </div>
        </section>
    )
}

export default Home;