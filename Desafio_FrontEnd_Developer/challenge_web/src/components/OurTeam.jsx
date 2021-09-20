//import do módulo do react
import React from "react";
//import das imagens utilizadas
import RW from '../imgs/RuthWoods.png'
import TR from '../imgs/TimothyReed.png'
import VV from '../imgs/VictoriaValdez.png'
import BL from '../imgs/BeverlyLittle.png'
import Facebook from '../icons/facebook.png'
import Twitter from '../icons/twitter.png'
import Linkedin from '../icons/linkedin.png'
//função contrutora do componente our team
export default function OurTeam() {
    return (
        //container our team
        <section id="OurTeam" class="container-fluid m-5">
            {/* container de cards de funcionários */}
            <div class=" row row-cols-1 row-cols-md-2 row-cols-lg-4 ">
                {/*  card de funcionário*/}
                <div class="col card pt-2">
                    {/*  foto de funcionário*/}
                    <img class="card-img-top p-1" src={RW} alt="Foto de Ruth Woods" />
                    {/* body do card */}
                    <div class="card-body p-0 m-1 ">
                        {/* nome cargo e descrição de funcionário */}
                        <h5 id="description" class="fw-bold fs-5"> Ruth Woods </h5>
                        <h6 id="font-red" class="mb-2" > FOUNDER, CEO </h6>
                        <p id="description" > Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent. condimentum cursus arcu netus donec neque posuere convallis lacinia, taciti at fames convallis dapibus viverra sollicitudin felis, eleifend placerat ut per pulvinar metus hac. </p>
                        {/* container dos icones de redes sociais */}
                        <div class="btn-toolbar  p-0 m-0" role="toolbar">
                            <div class="btn-group  my-n5 g-0" role="group">
                                <a class=" btn btn-outline-light " role="button" href="./"> <img src={Facebook} alt="Ícone do Facebook" /> </a>
                                <a class=" btn btn-outline-light " role="button" href="./"> <img src={Twitter} alt="Ícone do Twitter" /> </a>
                                <a class=" btn btn-outline-light " role="button" href="./"> <img src={Linkedin} alt="Ícone do Linkedin" /> </a>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  card de funcionário*/}
                <div class="col card pt-2">
                    {/*  foto de funcionário*/}
                    <img class="card-img-top p-1" src={TR} alt="Foto de Timothy Reed" />
                    {/* body do card */}
                    <div class="card-body p-0 m-1">
                        {/* nome cargo e descrição de funcionário */}
                        <h5 id="description" class="fw-bold fs-5"> Timothy Reed </h5>
                        <h6 id="font-red" class="mb-2"> CO-FOUNDER, DEVELOPER </h6>
                        <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent. condimentum cursus arcu netus donec neque posuere convallis lacinia, taciti at fames convallis dapibus viverra sollicitudin felis, eleifend placerat ut per pulvinar metus hac. </p>
                        {/* container dos icones de redes sociais */}
                        <div class="  btn-toolbar p-0 m-0" role="toolbar">
                            <div class="btn-group my-n5 g-0" role="group">
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Facebook} alt="Ícone do Facebook" /> </a>
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Twitter} alt="Ícone do Twitter" /> </a>
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Linkedin} alt="Ícone do Linkedin" /> </a>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  card de funcionário*/}
                <div class="col card pt-2">
                    {/*  foto de funcionário*/}
                    <img class="card-img-top p-1" src={VV} alt="Foto de Victoria Valdez" />
                    {/* body do card */}
                    <div class="card-body p-0 m-1">
                        {/* nome cargo e descrição de funcionário */}
                        <h5 id="description" class="fw-bold fs-5"> Victoria Valdez </h5>
                        <h6 id="font-red" > UI DESIGNER </h6>
                        <p id="description"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent. condimentum cursus arcu netus donec neque posuere convallis lacinia, taciti at fames convallis dapibus viverra sollicitudin felis, eleifend placerat ut per pulvinar metus hac. </p>
                        {/* container dos icones de redes sociais */}
                        <div class="  btn-toolbar p-0 m-0" role="toolbar">
                            <div class="btn-group my-n5 g-0" role="group">
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Facebook} alt="Ícone do Facebook" /> </a>
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Twitter} alt="Ícone do Twitter" /> </a>
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Linkedin} alt="Ícone do Linkedin" /> </a>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  card de funcionário*/}
                <div class="col card pt-2 ">
                    {/*  foto de funcionário*/}
                    <img class="card-img-top p-1" src={BL} alt="Foto de Beverly Little" />
                    {/* body do card */}
                    <div class="card-body p-0 m-1">
                        {/* nome cargo e descrição de funcionário */}
                        <h5 id="description" class="fw-bold fs-5"> Beverly Little </h5>
                        <h6 id="font-red" > DATA SCIENTIST </h6>
                        <p id="description" > Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent. condimentum cursus arcu netus donec neque posuere convallis lacinia, taciti at fames convallis dapibus viverra sollicitudin felis, eleifend placerat ut per pulvinar metus hac. </p>
                        {/* container dos icones de redes sociais */}
                        <div class="  btn-toolbar p-0 m-0" role="toolbar">
                            <div class="btn-group my-n5 g-0" role="group">
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Facebook} alt="Ícone do Facebook" /> </a>
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Twitter} alt="Ícone do Twitter" /> </a>
                                <a class="btn btn-outline-light " role="button" href="./"> <img src={Linkedin} alt="Ícone do Linkedin" /> </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}