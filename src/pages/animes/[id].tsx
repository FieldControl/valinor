import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

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

interface AnimeByIdProps {
  animeData: Anime;
}

export default function AnimeById({ animeData }: AnimeByIdProps) {
  console.log(animeData);

  return (
    <div className={styles.animeByIdContainer}>
      <img src={animeData.banner_image} alt={animeData.titles.en} />
      <div className={styles.contentContainer}>
        <header>
          <h1>{animeData.titles.en}</h1>
          <div>
            <div className={styles.card}>
              Duração miníma de cada episódio{" "}
              <span>({animeData.episode_duration} min)</span>
            </div>
            <div className={styles.card}>
              Total de episódios <span>({animeData.episodes_count})</span>
            </div>
          </div>
        </header>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: animeData.descriptions.en }}
        />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("anime?per_page=10");

  const params = data.data.documents?.map((anime) => {
    return {
      params: {
        id: anime.id.toString(),
      },
    };
  });

  return {
    paths: [...params],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params;
  const { data } = await api.get(`anime/${id}`);

  return {
    props: {
      animeData: data.data,
    },
  };
};
