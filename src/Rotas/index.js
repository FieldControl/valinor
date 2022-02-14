
import Inicio from "../telas/Inicio";
import Busca from "../telas/Busca";
import Perfil from "../telas/Perfil";

import { BrowserRouter, Routes, Route } from "react-router-dom";

const paths = {
  home: {
    label: "Home",
    path: "/",

    search: {
      label: "Search",
      path: "/search",
      path2: "/search/:searchText/:pagina",
      path3: "/search/:searchText/"
    },

    profile: {
      label: "Profile",
      path1: "/:perfil",
      path2: "/:perfil/:repositorioPerfil"
    }
  }
}


export default function Rotas () {
    return (
        <BrowserRouter>
          <Routes>
            <Route exact path={paths.home.path} element={ <Inicio /> } />
            <Route path={paths.home.search.path} element={ <Inicio /> } />

            <Route path={paths.home.search.path2} element={ <Busca /> } />
            <Route path={paths.home.search.path3} element={ <Busca /> } />
          
            <Route path={paths.home.profile.path1} element={ <Perfil /> } />
            <Route path={paths.home.profile.path2} element={ <Perfil /> } />

          </Routes>
        </BrowserRouter>
    )
}