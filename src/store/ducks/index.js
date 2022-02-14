import { combineReducers } from "redux";

import searchData from "./searchData";
import perfilData from "./perfilData";

const rootReducer = combineReducers({
    perfilData,
    searchData
})

export default rootReducer;