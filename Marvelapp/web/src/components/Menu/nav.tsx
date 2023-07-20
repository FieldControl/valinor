import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../Media/imgs/logo.png';
import '../Menu/style.css';

function Nav() {
    return (
        <header>
            <nav>
                <div className='logo'>
                    <Link to='/'>
                        <img src={Logo} alt='logo da marvel' />
                    </Link>
                </div>
                <Link to='/'>Personagens</Link>
                <Link to='/comics'>HQ</Link>
                <Link to='/series'>Séries</Link>
            </nav>
            <div className='home'>
                <h1>
                    Explore o Universo <strong>Marvel</strong> através da <strong>API</strong> da <strong>Marvel</strong>
                </h1>
            </div>
        </header>
    );
}

export default Nav;
