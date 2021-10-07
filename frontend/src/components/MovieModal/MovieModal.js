import React from "react";
import Modal from "react-modal";
import styles from "./modal.module.css";

Modal.setAppElement("#root");

const MovieModal = ({ selectedMovie, onClose }) => {
  const {
    Title,
    Year,
    Plot,
    Actors,
    Poster,
    Genre,
    Director,
    imdbRating,
  } = selectedMovie;

  const handleModalClose = () => {
    onClose(null);
  };

  return (
    <div>
      <Modal className={styles.modal} isOpen={true}>
        <div className={styles.movieContainer}>
          <div className={styles.textContainer}>
            <div className={styles.extra}>
              <span>{Year}</span>
              <span>{Genre}</span>
            </div>
            <h3>{Title}</h3>
            <div>
              <span>Plot</span>
              <p>{Plot}</p>
            </div>
            <div className={styles.cast}>
              <div>
                <span>Actors</span>
                <p>{Actors}</p>
              </div>
              <div>
                <span>Director</span>
                <p>{Director}</p>
              </div>
            </div>
            <div>
              <div className={styles.ratings}>
                <img
                  className={styles.logo}
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/1200px-IMDB_Logo_2016.svg.png"
                  alt="imdb logo"
                />
                <p className={styles.ratingsSpan}> {imdbRating}/10</p>
              </div>
            </div>
            <button onClick={handleModalClose}>Back</button>
          </div>
          <div className={styles.poster}>
            <img src={Poster} alt={Title} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MovieModal;
