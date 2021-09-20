//imports do módulo do react e da logo da empresa
import React from "react";
import Logo from '../icons/ActiveBox.png'

//função contrutora do componente do Header
export default function Header() {
    return (
        //container header
        <header class="container-fluid pb-5">
            {/* container da navegação */}
            <div class="col px-5 mb-5 container-fluid">
                {/* Componente de navegação */}
                <nav class=" text-center navbar row py-4 border-bottom border-secondary">
                    {/* logo da empresa */}
                    <div class="container-fluid col-md-6 col-sm-12 navbar ">
                        <img class="img-fluid" src={Logo} alt="Active Box Logo" />
                    </div>
                    {/* Navegação  */}
                    <div class="container-fluid navbar col ">
                        <div class="col m-1 p-0"><a class="navbar-text text-decoration-none text-reset" href="#Features"> <p class="m-0 "> Features </p> </a> </div>
                        <div class="col m-1 p-0"><a class="navbar-text text-decoration-none text-reset" href="#Works"> <p class="m-0"> Works </p> </a> </div>
                        <div class="col m-1 p-0"><a class="navbar-text text-decoration-none text-reset" href="#OurTeam"> <p class="m-0"> Our Team </p> </a> </div>
                        <div class="col m-1 p-0"><a class="navbar-text text-decoration-none text-reset" href="#Testimonials"> <p class="m-0"> Testimonials </p> </a> </div>
                        <div class="col m-1 p-0"><a class="navbar-text text-decoration-none text-reset" href="#Download"> <p class="m-0"> Download </p> </a> </div>
                    </div>
                </nav>
            </div>
            {/* Título e subtítulo da Header */}
            <div class=" text-center mx-5 ">
                <h1 class="container-fluid display-3 fw-bold">YOUR FAVORITE ONE PAGE  MULTI PURPOSE TEMPLATE</h1>
                <p> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent. condimentum cursus arcu netus donec neque posuere convallis lacinia, taciti at fames convallis dapibus viverra sollicitudin felis, eleifend placerat ut per pulvinar metus hac.</p>
            </div>
            {/* Botão da Header */}
            <div class="d-flex justify-content-center m-5 p-5">
                <a href="./"> <button type="button" class="btn btn-danger">FIND OUT MORE </button> </a>
            </div>

        </header>
    )


}