import React, { Component } from 'react';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Features from '../components/Features';
import Works from '../components/Works';
import Team from '../components/Team';
import Testimonials from '../components/Testimonials';
import Download from '../components/Download';
import Footer from '../components/Footer';

class Home extends Component {
    render() {
        return (
            <div>
                <section class="banner" role="banner">
                    {/* Header */}
                    <Header />

                    {/* Main Banner */}
                    <Banner />
                </section >

                {/* Features */}
                <Features />

                {/* Works */}
                <Works />

                {/* Team */}
                <Team />

                {/* Team */}
                <Testimonials />

                {/* Dowload */}
                <Download />

                {/* Footer */}
                <Footer />

            </div >
        );
    }
}
export default Home;