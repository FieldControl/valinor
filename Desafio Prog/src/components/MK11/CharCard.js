import React, { Component, useState } from "react";
import characters from "../../json";
import * as _ from "lodash";
import "./styles.css";
import { Howl, Howler } from "howler";

export default class CharCard extends Component {
  state = {
    selectedChar: null,
    toggled: null,
  };


  render() {
    /*These functions serve to assign an image of the PS4 or XBOX button 
    to the command that comes from the JSON*/
    const PS4Icons = {
      u: "U.png",
      d: "D.png",
      f: "F.png",
      b: "B.png",
      one: "1.png",
      two: "2.png",
      three: "3.png",
      four: "4.png",
      amp: "amp.png",
      l2: "L2.png",
      r2: "R2.png",
      j: "J.png",
      grab: "grab.png",
    };
  
    const xboxIcons = {
      u: "U.png",
      d: "D.png",
      f: "F.png",
      b: "B.png",
      one: "X.png",
      two: "Y.png",
      three: "A.png",
      four: "BB.png",
      amp: "RB.png",
      l2: "LT.png",
      r2: "RT.png",
      j: "J.png",
      grab: "LB.png",
    };

    /*This function receives the command array from the JSON of each character 
    and renders the commands in the format of PS4 controller buttons*/
    const renderPS4Icons = (command) => {
      return (
        <img
          alt={command}
          className="ps4Buttons"
          src={require(`../../assets/buttons/${PS4Icons[command]}`).default}
        />
      );
    };

    /*This function receives the command array from the JSON of each character 
    and renders the commands in the format of XBOX controller buttons*/
    const renderXboxIcons = (command) => {
      return (
        <img
          alt={command}
          className="ps4Buttons"
          src={require(`../../assets/buttons/${xboxIcons[command]}`).default}
        />
      );
    };

    /*These variables are used to store information from the objects of each character 
    coming from the array. I used the GET function to browse the objects and get the specific keys*/
    const charCombos = _.get(this.state.selectedChar, "combos");
    const charVariation = _.get(this.state.selectedChar, "variation");
    const charName = _.get(this.state.selectedChar, "name");
    const imageInside = _.get(this.state.selectedChar, "imageinside");


    //These slices are used to separe the exact number of characters I want to render per line
    const firstRow = characters.slice(0, 4);
    const middleRow = characters.slice(4, 34);
    const finalRow = characters.slice(34, 40);


    //This function will be used to play the sound of choice for each character (HOWLER LIB)
    const soundPlay = (src) => {
      const sound = new Howl({
        src,
        html5: true,
      });
      sound.play();
    };

    /*This is the main function of the home page, because it renders the image of 
    each character. Also, each character has assigned his state change to himself*/
    const renderCharCard = (charsArray) => {
      return _.map(charsArray, (char, index) => {
        const charImage =
          require(`../../assets/characters/${char.image}`).default;
        const charSound = require(`../../assets/sounds/${char.sound}`).default;
        return (
          <div
            className="charCard"
            onClick={() => {
              soundPlay(charSound);
              this.setState({ selectedChar: char });
            }}
          >
            <img class="charImage" src={charImage} />
          </div>
        );
      });
    };

    /*If the user clicks on any character, he would enter a new state 
    with all the information that will be taken from the JSON.*/
    return this.state.selectedChar ? (
      <div className="selectedCharPage">
        <div className="allContent">
          <div className="header">
            <div className="charSelectName">
              <h1>{charName}</h1>
            </div>
            <img
              className="charImageInside"
              src={
                require(`../../assets/charactersInside/${imageInside}`).default
              }
            />
          </div>
          <div className="charInfo">
            <div className="bonusStuff">
              <div className="leftSide">
                <img
                  className="ps4Buttons"
                  style={{ marginTop: "0px" }}
                  src={require(`../../assets/buttons/J.png`).default}
                />
                <h4>: JUMP IN COMBO DIRECTION</h4>
              </div>
              <div className="rightSide">
                <h4>XBOX INPUT</h4>
                <label className="switch">
                  <input type="checkbox" />
                  <span
                    className="slider"
                    onClick={() => {
                      this.setState({ toggled: !this.state.toggled });
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="kustomVariation">
              <h3 style={{ marginBottom: "1px" }}>KUSTOM VARIATION</h3>
              {/*/*This MAP function is used to navigate through the VARIATION array, which has the objects with the desired information*/}
              {_.map(charVariation, (variation, index) => {
                const charFirstSkill = _.get(variation, "firstSkill");
                const charSecondSkill = _.get(variation, "secondSkill");
                const charThirdSkill = _.get(variation, "thirdSkill");
                return (
                  /*Unitary images for each custom skill*/
                  <div className="skillsContainer">
                    <>
                      <img
                        className="skillImage"
                        src={
                          require(`../../assets/skills/${charFirstSkill}`)
                            .default
                        }
                      />
                      <img
                        className="skillImage"
                        src={
                          require(`../../assets/skills/${charSecondSkill}`)
                            .default
                        }
                      />

                      {/*Not every character has 3 skills, so if there is no third skill, it doesn't render anything*/}
                      {charThirdSkill ? (
                        <img
                          className="skillImage"
                          src={
                            require(`../../assets/skills/${charThirdSkill}`)
                              .default
                          }
                        />
                      ) : null}
                    </>
                  </div>
                );
              })}
              <h4 style={{ marginTop: "15px" }}>
                it's necessary to select these moves shown in the images above
              </h4>
              <h4>in your kustom variation to perform the combos below</h4>
            </div>
            <div className="allInfoContainer">
              <div className="combosContainer">
                {/*This MAP function is used to navigate through the COMBO array, which has the objects with the desired information*/}
                {_.map(charCombos, (combo, index) => {
                  const combosCommands = _.get(combo, "commands");
                  const combosDamage = _.get(combo, "damage");
                  const combosType = _.get(combo, "type");
                  return (
                    <div className="unitaryComboContainer">
                      <>
                        <h2 className="typeContainer">{combosType}</h2>
                        <div className="selectedChar">
                          <div className="combosButtons">
                            {/*If the toggle button is activated, change all the PS4 buttons shown to the xbox buttons*/}
                            {_.map(combosCommands, (command) => {
                              return this.state.toggled
                                ? renderXboxIcons(command)
                                : renderPS4Icons(command);
                            })}
                          </div>
                          <div className="comboDamage">
                            <h3>damage: {combosDamage}</h3>
                          </div>
                        </div>
                      </>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="buttonContainer">
            {/*The back button is used to reset state to null and return to home page*/}
            <button
              className="backButton"
              onClick={() => this.setState({ selectedChar: null })}
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    ) : (
      /*If no character is selected, it shows the home page*/
      <div className="containerMain">
        <img
          className="mk11-image"
          src={require("../../assets/mk11-logo.png").default}
        />
        <div className="charRows">
          <div className="charList">{renderCharCard(firstRow)}</div>
          <div className="charList" style={{ width: "500px" }}>
            {renderCharCard(middleRow)}
          </div>
          <div className="charList">{renderCharCard(finalRow)}</div>
        </div>
      </div>
    );
  }
}
