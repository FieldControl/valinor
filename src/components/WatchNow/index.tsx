import Link from "next/link";
import { useContext, useRef } from "react";
import { BsPlus } from "react-icons/bs";
import { AnimesContext } from "../../contexts/AnimesContex";
import { Arrows } from "../Arrows";

import styles from "./styles.module.scss";

interface WatchNowProps {
  title: string;
}

type Anime = {
  anilist_id: number;
  banner_image: string;
  cover_color: string;
  cover_image: string;
  descriptions: {
    en: string;
  };
  end_date: string;
  episode_duration: number;
  episodes_count: number;
  format: number;
  genres: string[];
  id: number;
  mal_id: number;
  score: number;
  season_period: number;
  season_year: number;
  start_date: string;
  status: number;
  titles: { en: string; jp: string };
  trailer_url: string;
};

type AnimeData = {
  current_page: number;
  documents: Anime[];
  last_page: number;
};

export function WatchNow({ title }: WatchNowProps) {
  const { animes, previousScroll, nextScroll, isFetching } =
    useContext(AnimesContext);

  const divRef = useRef(null);

  return (
    <section className={styles.watchNowContainer}>
      <div className={styles.arrowsTitle}>
        <h1>{title}</h1>
        <Arrows
          nextScroll={() => nextScroll(divRef.current)}
          previousScroll={() => previousScroll(divRef.current)}
          isFetching={isFetching}
        />
      </div>

      <div ref={divRef} className={styles.watchNowList}>
        {!!animes &&
          animes.map((anime, i) => (
            <div key={i} className={styles.watchNowItem}>
              <img src={anime.cover_image} alt={anime.titles.en} />
              <div className={styles.buttons}>
                <Link href={`animes/${anime.id}`}>
                  <button type="button">
                    <BsPlus size={32} />
                  </button>
                </Link>
                <Link href={`animes/${anime.id}`}>
                  <button type="button">Assistir Agora</button>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
