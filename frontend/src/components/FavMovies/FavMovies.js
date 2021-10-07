import React from "react";
import styles from "../Movies/movies.module.css";
import AddFavorite from "../AddFavorite/AddFavorite.js";

const FavMovies = ({ movies, handleFavouritesClick, onPersist }) => {
  const handleMovieClick = (imdbID) => {
    const movie = movies.find((movie) => movie.imdbID === imdbID);
    onPersist(movie);
  };
  return (
    <div className={styles.container}>
      {movies &&
        movies.map((movie) => {
          return (
            <div key={movie.imdbID} className={styles.imageContainer}>
              <img
                onClick={() => handleMovieClick(movie.imdbID)}
                className={styles.moviePoster}
                src={movie.Poster}
                alt={movie.Title}
              />
              <div className={styles.overlay}>
                <div className={styles.movieInfo}>
                  <span>{movie.Title}</span>
                  <span>{movie.Year}</span>
                </div>
                <div>
                  <AddFavorite
                    isActiveTest={true}
                    onButtonClick={() => handleFavouritesClick(movie)}
                  />
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default FavMovies;
