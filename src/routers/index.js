import Home from "./Home";

import { BrowserRouter, Switch, Route } from "react-router-dom";

import PesquisaRepo from "./PesquisaRepo";
import RepositorioDetalhado from "./RepositorioDetalhado";

function Rotas() {


    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={ Home } />
                <Route exact path="/search" component={ Home } />

                <Route exact path="/:nomeRepoParametro" component={ RepositorioDetalhado } />

                <Route 
                    path={`/search/:pesquisaParametro/:page?`}
                    component={ PesquisaRepo } 
                />
                
            </Switch>
        </BrowserRouter>
    )
}

export default Rotas;