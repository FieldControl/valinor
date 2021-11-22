import Head from "next/head";
import { AsideSearch } from "../components/AsideSearch";
import { MainAnime } from "../components/MainAnime";
import { RatedAnimes } from "../components/RatedAnimes";
import { WatchNow } from "../components/WatchNow";
import { AnimesContextProvider } from "../contexts/AnimesContex";

import styles from "./home.module.scss";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | Gnimes</title>
      </Head>

      <main className={styles.homeContainer}>
        <AnimesContextProvider>
          <section className={styles.mainContent}>
            <MainAnime />
            <WatchNow title="Assistir Agora" />
            <RatedAnimes />
          </section>
          <AsideSearch />
        </AnimesContextProvider>
      </main>
    </>
  );
}
