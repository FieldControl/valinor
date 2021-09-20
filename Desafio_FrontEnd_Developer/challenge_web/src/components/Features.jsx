//import do módulo do react
import React from "react";
//import das imagens utilizadas
import RulePencil from '../icons/rule&pencil.png'
import Monitor from '../icons/monitor.png'
import Lamp from '../icons/lamp.png'
import Atom from '../icons/atom.png'
import BriefCase from '../icons/briefcase.png'
import Cloud from '../icons/cloud-download.png'
//função construtora do componente 
export default function Features() {
  return (
    /* container de Features */
    <section class="container-fluid text-center" id="Features">
      {/* container de itens */}
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 m-5 gy-5">
        {/* item */}
        <div class="col">
          <img src={RulePencil} alt="ícone de régua e lápis" />
          <p id="title"> EASILY CUSTOMISED </p>
          <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent.</p>
        </div>
        {/* item */}
        <div class="col">
          <img src={Monitor} alt="Monitor" />
          <p id="title"> RESPONSIVE READY </p>
          <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent.</p>
        </div>
        {/* item */}
        <div class="col">
          <img src={Lamp} alt="Lampada" />
          <p id="title"> MODERN DESIGN </p>
          <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent.</p>
        </div>
        {/* item */}
        <div class="col">
          <img src={Atom} alt="Atomo" />
          <p id="title"> CLEAN CODE </p>
          <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent.</p>
        </div>
        {/* item */}
        <div class="col">
          <img src={BriefCase} alt="Maleta" />
          <p id="title"> READY TO SHIP </p>
          <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent.</p>
        </div>
        {/* item */}
        <div class="col">
          <img src={Cloud} alt="Download de Nuvem" />
          <p id="title"> DOWNLOAD FOR FREE </p>
          <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent.</p>
        </div>

      </div>
    </section>
  )
}