import { useEffect, useState } from "react";
import Link from "next/link";
import { HiPlus } from "react-icons/hi";
import { api } from "../../services/api";

import styles from "./styles.module.scss";

type Anime = {
  banner_image: string;
  cover_image: string;
  episode_duration: number;
  episodes_count: number;
  genres: string[];
  id: number;
  titles: { en: string; jp: string };
  season_period: number;
};

export function MainAnime() {
  const [anime, setAnime] = useState<Anime>({} as Anime);

  async function fetchAnime() {
    try {
      const response = await api.get("random/anime/1");
      const data = response.data.data[0] as Anime;
      setAnime(data);
    } catch (error) {}
  }

  useEffect(() => {
    fetchAnime();
  }, []);

  if (!anime.id) {
    return <div className=""> Carregando...</div>;
  }

  return (
    <>
      <div className={styles.mainAnimeContainer}>
        <img src={anime.banner_image} alt="" />
        <div className={styles.contentMainAnime}>
          <span>Temporada {anime.season_period}</span>
          <strong>{anime.titles.en}</strong>
          <span className={styles.gender}>
            {anime.genres.slice(0, 4).join(", ")}
          </span>
          <div className={styles.buttons}>
            <Link href={`/animes/${anime.id}`} passHref>
              <button type="button">Assistir Agora</button>
            </Link>
            <button type="button">
              <HiPlus />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
