import React, { Component } from 'react';

class Header extends Component {
    render() {
        return (
            <header id="header">
                <div class="header-content clearfix">
                    <a class="logo" href="#"><img src="images/logo.png" alt="" /></a>
                    <nav class="navigation" role="navigation">
                        <ul class="primary-nav">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#works">Works</a></li>
                            <li><a href="#teams">Our Team</a></li>
                            <li><a href="#testimonials">Testimonials</a></li>
                            <li><a href="#download">Download</a></li>
                        </ul>
                    </nav>
                    <a href="#" class="nav-toggle">Menu<span></span></a>
                </div>
            </header>
        )
    }
}

export default Header;