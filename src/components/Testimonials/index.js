import React, { Component } from 'react';

class Testimonials extends Component {
    render() {
        return (
            <section id="testimonials" class="section testimonials no-padding">
                <div class="container-fluid">
                    <div class="row no-gutter">
                        <div class="flexslider">
                            <ul class="slides">
                                <li>
                                    <div class="col-md-6">
                                        <div class="avatar">
                                            <img src="images/testimonial-1.jpg" alt="" class="img-responsive" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <blockquote>
                                            <p>"Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed
                                                odio dui. Aenean eu leo quam..."
                                            </p>
                                            <cite class="author">Susan Sims, Interaction Designer at XYZ</cite>
                                        </blockquote>
                                    </div>
                                </li>
                                <li>
                                    <div class="col-md-6">
                                        <div class="avatar">
                                            <img src="images/testimonial-2.jpg" alt="" class="img -responsive" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <blockquote>
                                            <p>"Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Aenean
                                                lacinia bibendum nulla sed consectetur...."
                                            </p>
                                            <cite class="author">Susan Sims, Interaction Designer at XYZ</cite>
                                        </blockquote>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Testimonials;