//import do módulo do react
import React from "react";
//import das imagens utilizadas
import Work1 from '../imgs/work1.png'
import Work2 from '../imgs/work2.png'
import Work3 from '../imgs/work3.png'
import Work4 from '../imgs/work4.png'
import Work5 from '../imgs/work5.png'
import Work6 from '../imgs/work6.png'
import Work7 from '../imgs/work7.png'
import Work8 from '../imgs/work8.png'
//função contrutora do componente works
export default function Works() {
  return (
    //container works
    <section class="container-fluid " id="Works">
      {/* container das imagens */}
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4">
        {/* imagem */}
        <img class="col " src={Work1} alt="Trabalho 1" />
        <img class="col " src={Work2} alt="Trabalho 2" />
        {/* imagem com texto em hover */}
        <div class="col showText">
          <img class="img-fluid " src={Work3} alt="Trabalho 3" />
          <div class="overlay"><div class="overText row"> <p>PROJECT NAME</p> <p class="fw-lighter">User Interface Design</p></div> </div>
        </div>
        {/* imagem */}
        <img class="col " src={Work4} alt="Trabalho 4" />
        <img class="col " src={Work5} alt="Trabalho 5" />
        <img class="col " src={Work6} alt="Trabalho 6" />
        <img class="col " src={Work7} alt="Trabalho 7" />
        <img class="col " src={Work8} alt="Trabalho 8" />
      </div>

    </section>
  )
}