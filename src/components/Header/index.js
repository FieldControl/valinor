import "./style.css";

import react_logo from "../../assets/react_logo.png";

function Header() {

    return (
        <header className="cabecalho">
            <img src={react_logo} className="imagem-cabecalho" />
        </header>
    )
}

export default Header;