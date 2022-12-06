/* eslint-disable import/prefer-default-export */
import styled from 'styled-components';

export const Container = styled.div`
  height: calc(100% - 94px);

  #auth {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 50;
    min-height: 32px;
    background-color: rgba(53, 95, 120, 0.4);
    padding: 7px 10px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.28);
    display: none;
  }
  #auth h1,
  #auth p,
  #auth label {
    display: none;
  }
  .auth-form-body {
    display: inline;
  }

  .logo {
    display: inline-block;
    margin-top: 35px;
  }
  .logo-img-2x {
    display: none;
  }
  @media only screen and (-webkit-min-device-pixel-ratio: 2),
    only screen and (min--moz-device-pixel-ratio: 2),
    only screen and (-o-min-device-pixel-ratio: 2/1),
    only screen and (min-device-pixel-ratio: 2),
    only screen and (min-resolution: 192dpi),
    only screen and (min-resolution: 2dppx) {
    .logo-img-1x {
      display: none;
    }
    .logo-img-2x {
      display: inline-block;
    }
  }
  #suggestions {
    margin-top: 35px;
    color: #ccc;
  }
  #suggestions a {
    color: #666666;
    font-weight: 200;
    font-size: 14px;
    margin: 0 10px;
  }

  #parallax_wrapper {
    position: relative;
    height: 100%;
    z-index: 0;
    -webkit-transition: all 0.25s ease-in;
    transition: all 0.25s ease-in;
  }
  #parallax_field {
    overflow: hidden;
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    width: 100%;
  }
  #parallax_field #parallax_bg {
    position: absolute;
    width: 110%;
    height: 110%;
    z-index: 1;
  }
  #parallax_illustration {
    display: block;
    margin: 0 auto;
    width: 940px;
    height: 100%;
    position: relative;
    overflow: hidden;
    clear: both;
  }
  #parallax_illustration img {
    position: absolute;
  }
  #parallax_illustration #parallax_error_text {
    top: 272px;
    left: 72px;
    z-index: 10;
  }
  #parallax_illustration #parallax_octocat {
    top: 294px;
    left: 356px;
    z-index: 9;
  }
  #parallax_illustration #parallax_speeder {
    top: 350px;
    left: 432px;
    z-index: 8;
  }
  #parallax_illustration #parallax_octocatshadow {
    top: 497px;
    left: 371px;
    z-index: 7;
  }
  #parallax_illustration #parallax_speedershadow {
    top: 463px;
    left: 442px;
    z-index: 6;
  }
  #parallax_illustration #parallax_building_1 {
    top: 273px;
    left: 467px;
    z-index: 5;
  }
  #parallax_illustration #parallax_building_2 {
    top: 313px;
    left: 762px;
    z-index: 4;
  }
`;
