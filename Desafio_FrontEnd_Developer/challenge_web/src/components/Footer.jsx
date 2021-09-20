//import do módulo do react
import React from "react";
//import do componente do font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
//import do icone para utilização no componente font awesome
import { faHeart } from "@fortawesome/free-solid-svg-icons"
//import das imagens utilizadas
import Facebook from "../icons/facebook.png"
import Twitter from "../icons/twitter.png"
import Linkedin from "../icons/linkedin.png"

//função contrutora do componente footer
export default function Footer() {
  return (
    //container do footer
    <footer class="container-fluid">
      {/* parte superior do footer */}
      <div id="footerTop" class="row p-5 text-center">
        {/* container de localização */}
        <div class="col">

          <h6 class="text-white"> LOCATION </h6>
          <p id="description" class="text-muted"> 3481 Metrose Place <br></br> Bervely Hills, CA 90210 </p>

        </div>
        {/* container de redes sociais */}
        <div class="col">

          <p id="description" class="text-white m-0 p-0 "> SHARE WITH LOVE </p>
          <div class="">
            <a class="m-1 btn btn-outline-light " role="button" href="./"> <img src={Facebook} alt="Ícone do Facebook" /> </a>
            <a class="m-1 btn btn-outline-light " role="button" href="./"> <img src={Twitter} alt="Ícone do Twitter" /> </a>
            <a class="m-1 btn btn-outline-light " role="button" href="./"> <img src={Linkedin} alt="Ícone do Linkedin" /> </a>
          </div>

        </div>
        {/* container de sobre */}
        <div class="col ">

          <h6 class="text-white"> ABOUT ACTIVEBOX </h6>
          <p id="description" class="text-secondary"> Lorem ipsum etiam molestie feugiat pretium viverra interdum, lorem luctus sociosqu platea blandit fermentum, elit a fames arcu quisque aptent.</p>

        </div>
      </div>
      {/* parte inferior do footer */}
      <div id="footerBaseline" class="row text-center pt-4 pb-2">
        <p id="description" class="text-muted">Copyright © 2015 ActiveBox. All Rights Reserved<br>
          </br>Made with <FontAwesomeIcon color="red" icon={faHeart} />
          <span class="text-white"> by Gabriel Xavier</span>
        </p>
      </div>

    </footer>
  )
}