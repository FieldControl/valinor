import React from "react";
import styles from "./movies.module.css";
import AddFavorite from "../AddFavorite/AddFavorite";

const MovieList = ({ movies, handleFavouritesClick, onPersist }) => {
  const handleMovieClick = (imdbID) => {
    const movie = movies.find((movie) => movie.imdbID === imdbID);
    onPersist(movie);
  };

  return (
    <div>
      <div className={styles.container}>
        {movies &&
          movies.map(
            ({
              imdbID,
              Poster,
              Title,
              Year,
              Plot,
              Genre,
              Director,
              imdbRating,
            }) => {
              return (
                <div key={imdbID} id={imdbID} className={styles.imageContainer}>
                  <img
                    onClick={() => handleMovieClick(imdbID)}
                    className={styles.moviePoster}
                    src={Poster}
                    alt={Title}
                  />
                  <div className={styles.overlay}>
                    <div className={styles.movieInfo}>
                      <span>{Title}</span>
                      <span>{Year}</span>
                    </div>
                    <div>
                      <AddFavorite
                        isActiveTest={false}
                        onButtonClick={() =>
                          handleFavouritesClick({
                            imdbID,
                            Poster,
                            Title,
                            Year,
                            Plot,
                            Genre,
                            Director,
                            imdbRating,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            }
          )}
      </div>
    </div>
  );
};

export default MovieList;
