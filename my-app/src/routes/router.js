import React from "react"
import {
    BrowserRouter,
    Routes,
    Route,


} from "react-router-dom";





import Characterslist from "../components/characters/characterlist";
import CardId from "../components/characters/charactersid";
import ComicsId from "../components/characters/comicsId";
import Comicslist from "../components/characters/comicslist";
import EventsId from "../components/characters/eventsId";
import Eventslist from "../components/characters/eventslist";
import Footer from "../components/characters/footer";
import NavBar from "../components/characters/navbar/navBar";
import SeriesId from "../components/characters/seriesId";
import Serieslist from "../components/characters/serieslist";



//ROTAS DA SPA . 
const Router = () => {
    return (
        <BrowserRouter>

            <NavBar />
            <Routes >

                <Route exact path="/characters" element={<Characterslist />} />
                <Route exact path="/comics" element={<Comicslist />} />
                <Route exact path="/events" element={<Eventslist />} />
                <Route exact path="/series" element={<Serieslist />} />
                <Route exact path="/charactersid/:id" element={<CardId />} />
                <Route exact path="/comicsid/:id" element={<ComicsId />} />
                <Route exact path="/eventsid/:id" element={<EventsId />} />
                <Route exact path="/seriesid/:id" element={<SeriesId />} />

            </Routes>

            <Footer />

        </BrowserRouter>
    )
}

export default Router;