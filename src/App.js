import React from "react";
import './App.css';

import Routers from "./routers";

import Header from "./components/Header";

function App() {

    return (
        <div className="main">
            <Header />
            <Routers />
        </div>
    );
}

export default App;
