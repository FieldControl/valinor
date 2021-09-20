//import do módulo do react
import React from "react"
//função contrutora do componente testimonials
export default function Download() {
    return (
         //container do componente download
        <section id="Download" >
            <div class="m-5 ">
                <h2 id="title" class="row justify-content-center text-center m-2"> Are You Ready to Start? Download Now For Free!
                </h2>
                <h6 id="description" class="text-center">FUSCE DAPIBUS, TELLUS AC CURSUS COMMODO</h6>
                {/* botão de download */}
                <div class='row justify-content-center m-4'>
                    <button type="button" class="btn btn-danger col-auto  "><p id="bLabel" class="m-0 py-0 px-5">DOWNLOAD HERE</p></button>
                </div></div>
        </section>
    )
}