import React from 'react';

import bg404 from '~/assets/img/404bg.png';
import not404 from '~/assets/img/404not.png';
import gitGuy from '~/assets/img/gitGuy.png';
import spaceship from '~/assets/img/spaceship.png';
import shadow from '~/assets/img/shadow.png';
import spaceshipShadow from '~/assets/img/spaceshipShadow.png';
import cavern from '~/assets/img/cavern.png';
import smallCavern from '~/assets/img/smallCavern.png';

import { Container } from './styles';

const Error404: React.FC = () => {
  return (
    <Container>
      <div id="parallax_wrapper">
        <div id="parallax_field">
          <img alt="Error 404" className="js-plaxify" data-invert="true" data-xrange="0" data-yrange="20" height="415" id="parallax_bg" width="940" src={bg404} />
        </div>

        <div id="parallax_illustration">
          <div id="auth" />
          <img
            alt="404 This is not the web page you are looking for"
            className="js-plaxify"
            data-xrange="20"
            data-yrange="10"
            height="249"
            id="parallax_error_text"
            width="271"
            src={not404}
          />
          <img alt="Git Guy" className="js-plaxify" data-xrange="10" data-yrange="10" height="230" id="parallax_octocat" width="188" src={gitGuy} />
          <img alt="Spaceship" className="js-plaxify" data-xrange="10" data-yrange="10" height="156" id="parallax_speeder" width="440" src={spaceship} />
          <img alt="Shadow" className="js-plaxify" data-xrange="10" data-yrange="10" height="49" id="parallax_octocatshadow" width="166" src={shadow} />
          <img alt="Spaceship Shadow" className="js-plaxify" data-xrange="10" data-yrange="10" height="75" id="parallax_speedershadow" width="430" src={spaceshipShadow} />

          <img alt="Cavern" className="js-plaxify" data-invert="true" data-xrange="50" data-yrange="20" height="123" id="parallax_building_1" width="304" src={cavern} />

          <img alt="Small Cavern" className="js-plaxify" data-invert="true" data-xrange="75" data-yrange="30" height="50" id="parallax_building_2" width="116" src={smallCavern} />
        </div>
      </div>
    </Container>
  );
};

export default Error404;
