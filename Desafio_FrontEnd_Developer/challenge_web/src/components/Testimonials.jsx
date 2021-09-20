//import do modulo react e da variavel useState para alteração de estado
import React, { useState } from "react";
//import do componente carousel do modulo react-booststrap
import Carousel from 'react-bootstrap/Carousel'
//import da imagem utilizada
import T1 from '../imgs/client.png'
//função contrutora do componente testimonials
export default function Testimonials() {

    //variaveis para controle de index
    const [index, setIndex] = useState(0);
    //função para setar o index
    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    }
    // função para regredir o index
    const onPrevClick = () => {
        if (index > 0) {
            setIndex(index - 1);
        } else if (index === 0) setIndex(2);
    };
    // função para prosseguir o index
    const onNextClick = () => {
        if (index === 2) {
            setIndex(0);
        } else if (index === 0 || index > 0) setIndex(index + 1);
    };

    return (
        //container do componente testimonials
        <section id="Testimonials" >
            {/* lado esquerdo do container */}
            <div class="row row-cols-1 row-cols-xl-2 container-fluid p-0 m-0">
                {/* carousel para animação de slide de imagens */}
                <div class="col p-0 ">
                    <Carousel activeIndex={index} onSelect={handleSelect} fade controls={false}  >
                        <Carousel.Item>
                            <img class="d-block w-100" src={T1} alt="First slide" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img class="d-block w-100" src={T1} alt="Second slide" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img class="d-block w-100" src={T1} alt="Third slide" />
                        </Carousel.Item>
                    </Carousel>
                </div>
                {/* lado direito do container */}
                <div class="col container-fluid bg-purple ">
                    <div class="mt-5 pt-3 pe-5">
                        {/* bloco de comentários do cliente */}
                        <blockquote>
                            <p id="cita" class="description text-justify m-3 p-0 ">"Lorem ipsum nam lacinia tempor, congue sed litora purus etiam, fames suspendisse tortor. vel erat tellus egestas class egestas molestie etiam augue hendrerit morbi sodales nunc, quam quisque a lacinia curae blandit mauris sem dolor lacinia scelerisque fusce sodales, malesuada nunc ut class scelerisque nostra dapibus aliquam egestas phasellus id. "</p>
                            <footer class="blockquote-footer m-3 p-0">Isabelle Juarez, Cleveland - Ohio - USA </footer>
                        </blockquote>
                        {/* controles de slide */}
                        <div class="d-flex justify-content-center mt-5 mb-4">
                            <span aria-hidden="true" class="carousel-control-prev-icon" onClick={onPrevClick} />
                            <span aria-hidden="true" class="carousel-control-next-icon" onClick={onNextClick} />
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )


}



