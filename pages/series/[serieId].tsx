import { GetServerSideProps } from "next";
import Image from "next/image";
import { useApiSearchById } from "../../libs/useApiSearchById";
import imgNotFound from "../../assets/images/image_not_available.jpg";
import { useEffect, useState } from "react";
import Article from "../../components/Article";
import { ISerie } from "../../interfaces/ISerie";

const Serie = ({ data }: ISerie) => {
  const [serie, setserie] = useState(data[0]);
  const thumbnail = serie.thumbnail ? serie.thumbnail.path + "." + serie.thumbnail.extension : imgNotFound;

  useEffect(() => {
    console.log(serie);
  }, []);

  return (
    <div className="my-2 px-2 w-full min-h-screen overflow-hidden min-[2560px]:w-[2000px]">
      <h1 className="relative bg-neutral-800 mb-2 flex items-center justify-center uppercase text-center text-white text-2xl pt-1 w-full min-[2560px]:h-24 min-[2560px]:text-6xl corner">
        {serie.title}
      </h1>

      <div className="w-full block md:flex md:gap-3">
        <aside className={`asideItem`}>
          <Image
            src={thumbnail && thumbnail}
            width={400}
            height={500}
            alt={"Image of " + serie.title}
            className="w-full h-full border-b-4 md:border-b-0 border-neutral-800 bg-red-600 pb-1 md:pb-3"
            priority
          />
        </aside>

        <section className="relative my-2 overflow-hidden md:w-3/5">
          <h6 className="text-xs text-neutral-400 mb-2 min-[2560px]:text-2xl">Modified: {serie.modified.split("T")[0]}</h6>

          <article className="flex flex-col mb-2">
            <h2 className="text-lg font-bold min-[2560px]:text-4xl">Name: </h2>
            <p className="p-1 ml-1 min-[2560px]:text-3xl min-[2560px]:p-6">{serie.title}</p>
          </article>

          <article className="flex flex-col mb-2 md:min-h-[265px]">
            <h2 className="text-lg font-bold min-[2560px]:text-4xl">Description: </h2>
            <p className="p-1 ml-1 min-[2560px]:text-3xl min-[2560px]:p-6">
              {serie.description ? serie.description : "There is no description yet for " + serie.title + "."}
            </p>
          </article>

          <Article type="Start Year" data={serie.startYear} path="tv-shows" />

          <Article type="End Year" data={serie.endYear} path="tv-shows" />

          <Article type="Rating" data={serie.rating} path="tv-shows" />

          <Article type="Type" data={serie.type} path="tv-shows" />

          <Article type="Creators" data={serie.creators.available} path="tv-shows" />

          <Article type="Characters" data={serie.characters.available} path="tv-shows" />

          <Article type="Stories" data={serie.stories.available} path="tv-shows" />

          <Article type="Comics" data={serie.comics.available} path="tv-shows" />

          <Article type="Events" data={serie.events.available} path="tv-shows" />
        </section>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serieId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(privatekey as string, "series", Number(serieId));
  const serie = await apiById.getData();

  return {
    props: {
      data: serie.results,
    },
  };
};

export default Serie;
