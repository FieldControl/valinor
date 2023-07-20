import React from "react";

const ErrorPage = () => {
    return (
        <div>
            <video autoPlay muted loop>
                <source src="../../src/Media/video/animation.mp4" type="video/mp4" />
                Seu navegador não suporta a reprodução de vídeos em HTML5.
            </video>
        </div>
    );
};

export default ErrorPage;
