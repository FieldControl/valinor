import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  // useEffect(() => {
  //   setTimeout(() => {
  //     router.push("/characters");
  //   }, 3000);
  // }, []);

  return (
    <section className="w-full h-screen -m-2 bg-red-600 text-white flex flex-col gap-6 items-center justify-center">
      <article className="border-8 border-white flex flex-col items-center justify-center p-2">
        <span className="uppercase text-8xl">MARVEL</span>
        <span className="text-4xl uppercase -mt-4">Field Control</span>
      </article>
      <article className="uppercase text-6xl">Welcome!!!</article>
      <nav>
        <ul className="flex flex-wrap gap-4">
          <li className="flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl">Character</li>
          <li className="flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl">Comics</li>
          <li className="flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl">Creators</li>
          <li className="flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl">Events</li>
          <li className="flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl">Series</li>
          <li className="flex items-center justify-center p-2 uppercase border-4 border-white w-24 text-2xl">Stories</li>
        </ul>
      </nav>
    </section>
  );
};

export default Home;
