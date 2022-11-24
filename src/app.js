import { createSearchParameters } from "./modules/searchParameters.js";
import { handleSearchClick } from "./modules/search.js";

createSearchParameters();

const searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", handleSearchClick);

document.addEventListener("keypress", (event) => {
  switch (event.key) {
    case "Enter":
      searchButton.focus();
      handleSearchClick();
      break;
    case "a":
    case "b":
    case "c":
    case "d":
    case "e":
    case "f":
    case "g":
    case "h":
    case "i":
    case "j":
    case "k":
    case "l":
    case "m":
    case "n":
    case "o":
    case "p":
    case "q":
    case "r":
    case "s":
    case "t":
    case "u":
    case "v":
    case "w":
    case "x":
    case "y":
    case "z":
      const queryInput = document.getElementById("queryInput");
      if (document.activeElement !== queryInput && queryInput.value == "") {
        queryInput.focus();
      }
  }
});
