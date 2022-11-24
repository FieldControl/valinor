import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Home = () => {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState("");

  const handlePageButton = (value: string) => {
    setPageLoading(value);
  };

  useEffect(() => {
    setPageLoading("");
  }, []);

  return (
    <section id="homeContent" className="w-full min-h-screen h-auto -m-2 bg-red-600 text-white flex flex-col gap-10 items-center justify-evenly">
      <article className="w-full uppercase text-4xl md:text-6xl  text-center animate-pulse">Welcome!!!</article>
      <article className="border-8 border-white flex flex-col items-center justify-center p-2">
        <span className="uppercase text-8xl">MARVEL</span>
        <span className="text-4xl uppercase -mt-4">Field Control</span>
      </article>
      <nav id="links">
        <ul className="w-full flex justify-center flex-wrap gap-4 p-2">
          <li
            className={`flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl ${
              pageLoading === "characters" && "animate-ping"
            }`}
            onClick={() => setPageLoading("characters")}
          >
            <Link href="/characters">Character</Link>
          </li>
          <li
            className={`flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl ${
              pageLoading === "comics" && "animate-ping"
            }`}
            onClick={() => setPageLoading("comics")}
          >
            <Link href="/comics">Comics</Link>
          </li>
          <li
            className={`flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl ${
              pageLoading === "creators" && "animate-ping"
            }`}
            onClick={() => setPageLoading("creators")}
          >
            <Link href="/creators">Creators</Link>
          </li>
          <li
            className={`flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl ${
              pageLoading === "events" && "animate-ping"
            }`}
            onClick={() => setPageLoading("events")}
          >
            <Link href="/events">Events</Link>
          </li>
          <li
            className={`flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl ${
              pageLoading === "series" && "animate-ping"
            }`}
            onClick={() => setPageLoading("series")}
          >
            <Link href="/series">Series</Link>
          </li>
          <li
            className={`flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl ${
              pageLoading === "stories" && "animate-ping"
            }`}
            onClick={() => setPageLoading("stories")}
          >
            <Link href="/stories">Stories</Link>
          </li>
        </ul>
      </nav>
    </section>
  );
};

export default Home;
