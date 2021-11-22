import { useEffect, useRef, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { api } from "../../services/api";
import Link from "next/link";

import styles from "./styles.module.scss";

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
  count: number;
  current_page: number;
  documents: Anime[];
  last_page: number;
};

export function AsideSearch() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("a");
  const [isFetching, setIsFetching] = useState(false);

  const divRef = useRef(null);

  const [animesData, setAnimesData] = useState<AnimeData>({
    documents: [],
  } as AnimeData);

  async function fectchingSearchAnime() {
    setIsFetching(true);
    try {
      const response = await api.get(
        `anime?title=${search}&per_page=3&page=${page}`
      );
      const data = response.data.data;
      setAnimesData({ ...data });
    } catch (error) {}
    setIsFetching(false);
  }

  async function fectchingSearchAnimeMore() {
    setIsFetching(true);
    try {
      const response = await api.get(
        `anime?title=${search}&per_page=3&page=${page}`
      );
      const data = response.data.data;
      const newAnimes = [...animesData.documents, ...data.documents];
      setAnimesData({ ...data, documents: newAnimes });
    } catch (error) {}
    setIsFetching(false);
    scrollTopMaxSearchingAnime();
  }

  useEffect(() => {
    fectchingSearchAnime();
  }, [search]);

  useEffect(() => {
    if (page !== 1 && page <= animesData.last_page) {
      fectchingSearchAnimeMore();
    }
  }, [page]);

  // Function for scroll rolling até o ultimo elemento quando clicar no botão 'Carregar mais'

  function scrollTopMaxSearchingAnime() {
    if (divRef.current) {
      divRef.current.scrollTo({
        top: divRef.current.scrollTopMax,
      });
    }
  }

  return (
    <aside className={styles.asideSearchContainer}>
      <div className={styles.asideButtonSearch}>
        <label htmlFor="search">
          <BsSearch />
        </label>
        <input
          placeholder="Procure pelo título"
          type="text"
          id="search"
          name="search"
          onBlur={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.animesSearching}>
        <h1>
          Animes Encontrados <span>({animesData.count})</span>
        </h1>
        <div ref={divRef} className={styles.animeItemContainer}>
          {animesData.documents?.length > 0 &&
            animesData.documents.map((anime, i) => (
              <Link key={i} href={`/animes/${anime.id}`} passHref>
                <div className={styles.animeItem}>
                  <div>
                    <img src={anime.cover_image} alt={anime.titles?.en} />
                    <div className={styles.contentAnimeItem}>
                      <strong>{anime.titles.en}</strong>
                      <span>{anime.genres.slice(0, 4).join(", ")}</span>
                    </div>
                  </div>
                  <span>SCORE: ({anime.score})</span>
                </div>
              </Link>
            ))}
        </div>
        {page < animesData.last_page && (
          <button
            disabled={isFetching}
            onClick={() => {
              setPage(page + 1);
              scrollTopMaxSearchingAnime();
            }}
            type="button"
          >
            {isFetching ? "Carregando..." : "Carregar mais"}
          </button>
        )}
      </div>
    </aside>
  );
}
