import { useEffect, useState } from "react";
import { BsHddStack, BsSearch } from "react-icons/bs";
import { Pagination } from "../../components/Pagination";
import Link from "next/link";
import { api } from "../../services/api";
import styles from "./animes.module.scss";

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

export default function Animes() {
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);

  const [title, setTitle] = useState("");
  const [genres, setGenres] = useState("");
  const [year, setYear] = useState("");

  const [animesData, setAnimesData] = useState<AnimeData>({} as AnimeData);

  async function fetchingAnimesData() {
    setIsFetching(true);
    try {
      let requestUrl =
        !!genres || !!year
          ? `anime?per_page=24&title=${title}&page=${page}&genres=${genres}&year=${year}`
          : `anime?per_page=24&title=${title}&page=${page}`;

      const response = await api.get(requestUrl);
      const data = response.data.data;

      setAnimesData(data);
    } catch (error) {}
    setIsFetching(false);
  }

  useEffect(() => {
    fetchingAnimesData();
  }, [title, page, genres, year]);

  const hasNextPage = page <= animesData.last_page;

  function nextPage({ number = undefined, next = false }) {
    if (hasNextPage) {
      if (!!number) {
        setPage(number);
        return;
      }
      if (next) {
        setPage(page + 1);
        return;
      }
    }
  }
  function previousPage({ number = undefined, next = false }) {
    if (page > 0) {
      if (number) {
        setPage(number);
        return;
      }
      if (next) {
        setPage(page - 1);
      }
    }
  }

  return (
    <div className={styles.animesContainer}>
      <div className={styles.animesFilterContainer}>
        <div title="Abrir os filtros" className={styles.filterComponent}>
          <BsHddStack />
          <strong>Filtros</strong>
        </div>

        <div className={styles.animesFilter}>
          <div className={styles.filterButton}>
            <label htmlFor="title">
              <strong>Título: </strong>
            </label>
            <input
              placeholder="Procure pelo título"
              type="text"
              id="title"
              name="title"
              onBlur={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className={styles.filterButton}>
            <label htmlFor="genres">
              <strong>Genêros: </strong>
            </label>
            <input
              placeholder="Procure pelo genêros"
              type="text"
              id="genres"
              name="genres"
              onBlur={(e) => setGenres(e.target.value)}
            />
          </div>
          <div className={styles.filterButton}>
            <label htmlFor="title">
              <strong>Ano: </strong>
            </label>
            <input
              placeholder="Procure pelo ano"
              type="number"
              min={1920}
              id="year"
              name="year"
              onBlur={(e) => setYear(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.animesList}>
        {isFetching ? (
          <strong>Carregando...</strong>
        ) : (
          <>
            {!!animesData.documents ? (
              animesData.documents.map((anime, i) => (
                <Link key={i} href={`/animes/${anime.id}`} passHref>
                  <div className={styles.animeItem}>
                    <img src={anime.cover_image} alt={anime.titles.en} />
                    <div>
                      <strong>
                        {anime.titles.en}{" "}
                        <span>
                          (
                          {new Date(anime.start_date).toLocaleDateString(
                            "pt-BR",
                            {
                              year: "numeric",
                            }
                          )}
                          )
                        </span>
                      </strong>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <strong>NÃO FOI ENCONTRADO NENHUM ANIME :(</strong>
            )}
          </>
        )}
      </div>
      {!!animesData.documents && (
        <Pagination
          count={animesData.count}
          currentPage={animesData.current_page}
          lastPage={animesData.last_page}
          nextPage={nextPage}
          previousPage={previousPage}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}
