import { useContext, useRef } from "react";
import { AnimesContext } from "../../contexts/AnimesContex";
import { Arrows } from "../Arrows";

import styles from "./styles.module.scss";

export function RatedAnimes() {
  const { animesRated, isFetching, nextScroll, previousScroll } =
    useContext(AnimesContext);

  const divRef = useRef(null);

  return (
    <section className={styles.ratedContainer}>
      <div className={styles.arrowsTitle}>
        <h1>Top Avaliação</h1>
      </div>
      <div ref={divRef} className={styles.ratedAnimeList}>
        {animesRated.length > 0 &&
          animesRated.map((anime, i) => (
            <div key={i} className={styles.ratedAnimeItem}>
              <img src={anime.cover_image} alt={anime.titles.en} />
              <div>
                <strong>
                  {anime.titles.en}{" "}
                  <span>
                    (
                    {new Date(anime.start_date).toLocaleDateString("pt-BR", {
                      year: "numeric",
                    })}
                    )
                  </span>
                </strong>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
