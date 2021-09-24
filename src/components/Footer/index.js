import React, { Component } from 'react';

class Footer extends Component {
    render() {
        return (
            <footer class="footer">
                <div class="footer-top">
                    <div class="container">
                        <div class="row">
                            <div class="footer-col col-md-4">
                                <h5>Location</h5>
                                <p>3481 Melrose Place<br />Beverly Hills, CA 90210</p>
                            </div>
                            <div class="footer-col col-md-4">
                                <h5>Share with Love</h5>
                                <ul class="footer-share">
                                    <li><a href="#"><i class="fa fa-facebook"></i></a></li>
                                    <li><a href="#"><i class="fa fa-twitter"></i></a></li>
                                    <li><a href="#"><i class="fa fa-linkedin"></i></a>
                                    </li>
                                    <li><a href="#"><i class="fa fa-google-plus"></i></a></li>
                                </ul>
                            </div>
                            <div class="footer-col col-md-4">
                                <h5>About ActiveBox</h5>
                                <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec ullamcorper nulla non
                                    metus auctor fringilla.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="container">
                        <div class="col-md-12">
                            <p>Made with <i class="fa fa-heart pulse"></i> by
                                <a href="https://github.com/wenblack"> Wenblack</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }
}

export default Footer;