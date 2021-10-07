import MovieList from "./components/Movies/MovieList";
import MovieService from "./services/MovieService";
import SearchBox from "./components/SearchBox/SearchBox";
import { useEffect, useState } from "react";
import FavMovies from "./components/FavMovies/FavMovies";
import MovieModal from "./components/MovieModal/MovieModal";

import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [favourites, setFavourites] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findByTitle = (searchValue) => {
    MovieService.findByTitle(searchValue)
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //add Favorito
  const addFavouriteMovie = (movie) => {
    const validateMovie = favourites.find(
      (favourite) => favourite.imdbID === movie.imdbID
    );
    if (!validateMovie) {
      let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const newFavouriteList = [movie, ...favorites];
      console.log(favorites);

      localStorage.setItem("favorites", JSON.stringify(newFavouriteList));

      setFavourites(newFavouriteList);
    }
  };
  //remove Favorito
  const removeFavouriteMovie = (movie) => {
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavouriteList = favorites.filter(
      (favourite) => favourite.imdbID !== movie.imdbID
    );
    localStorage.setItem("favorites", JSON.stringify(newFavouriteList));
    setFavourites(newFavouriteList);
  };

  const handleModalPersist = async (movie) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fullMovieInfo = await MovieService.useID(movie.imdbID);

    setSelectedMovie(fullMovieInfo.data);

    setIsModalOpen(true);
  };

  useEffect(() => {
    findByTitle(searchValue);
  }, [findByTitle, searchValue]);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Movie Box</h1>
      <SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
      {movies.length === 0 && <h1>Nada por aqui</h1>}

      {movies.length > 0 && (
        <div>
          <div>
            <h2>Favourites</h2>
            <FavMovies
              movies={favourites}
              handleFavouritesClick={removeFavouriteMovie}
              onPersist={handleModalPersist}
            />
          </div>
          <div>
            <h2>Movie List</h2>
            <MovieList
              movies={movies}
              handleFavouritesClick={addFavouriteMovie}
              onPersist={handleModalPersist}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <MovieModal selectedMovie={selectedMovie} onClose={handleClose} />
      )}
    </div>
  );
}

export default App;
