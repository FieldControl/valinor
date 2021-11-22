import {
  createContext,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../services/api";

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

interface AnimesContextData {
  animes: Anime[];
  isFetching: boolean;
  nextScroll: (current) => void;
  previousScroll: (current) => void;
  divAnimeListRef: MutableRefObject<any>;
  animesRated: Anime[];
}

export const AnimesContext = createContext<AnimesContextData>(
  {} as AnimesContextData
);

interface AnimesContextProvider {
  children: ReactNode;
}

export function AnimesContextProvider({ children }: AnimesContextProvider) {
  // Disabilitar o botão que busca mais animes da api se 'isFetching' for true
  const [isFetching, setIsFetching] = useState(false);

  // Pagina atual para controlar a página
  const [page, setPage] = useState(1);

  // Dados retornados da api
  const [animesData, setAnimesData] = useState<AnimeData>({
    documents: [],
  } as AnimeData);

  // Dados dos animes mais bem availiados
  const [animesRated, setAnimesRated] = useState<Anime[]>([]);

  // Função que busca só os mais bem avaliados
  async function fetchinAnimesRated() {
    try {
      const response = await api.get(
        "anime?sort_fields=score&sort_directions=-1&per_page=20"
      );
      setAnimesRated(response.data.data.documents);
    } catch (error) {}
  }

  // Função que busca os dados na api com páginação
  async function fetchingAnimes() {
    try {
      const response = await api.get(`anime?per_page=10&page=${page}`);
      const data = await response.data.data;
      const documents = [...animesData.documents, ...data.documents];
      const newAnimeData = {
        ...data,
        documents,
      };
      setAnimesData(newAnimeData);
      setIsFetching(false);
    } catch (error) {
      console.log(error);
    }

    return;
  }

  // Efeito colateral que atualiza os dados toda vez que a página atual é alterada
  useEffect(() => {
    fetchingAnimes();
  }, [page]);

  // Efeito colateral que é chamado quando a contextApi é iniciada
  useEffect(() => {
    fetchinAnimesRated();
  }, []);

  // Referencia da div para controlar o scroll
  const divAnimeListRef = useRef(null);

  // Funcao que scrolling para frente
  async function nextScroll(current) {
    if (current) {
      let scrolling = current.scrollLeft + current.offsetWidth - 200;
      if (scrolling < current.scrollLeftMax) {
        current.scrollLeft = scrolling;
      } else {
        current.scrollLeft =
          current.scrollLeft +
          (current.scrollLeft - current.scrollLeftMax) * -1;
        setPage(page + 1);
        setIsFetching(true);
      }
    }
    return;
  }

  // Funcao que scrolling para trás
  function previousScroll(current) {
    if (current) {
      let scrolling = current.scrollLeft - current.offsetWidth + 200;

      if (scrolling > 0) {
        current.scrollLeft = scrolling;
      } else {
        current.scrollLeft = 0;
      }
    }
    return;
  }

  return (
    <AnimesContext.Provider
      value={{
        animes: animesData.documents,
        isFetching,
        nextScroll,
        previousScroll,
        divAnimeListRef,
        animesRated,
      }}
    >
      {children}
    </AnimesContext.Provider>
  );
}
