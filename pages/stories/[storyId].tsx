import { GetServerSideProps } from "next";
import Image from "next/image";
import { useApiSearchById } from "../../libs/useApiSearchById";
import imgNotFound from "../../assets/images/image_not_available.jpg";
import { useEffect, useState } from "react";
import Article from "../../components/Article";
import { ISerie } from "../../interfaces/ISerie";

const Story = ({ data }: ISerie) => {
  const [story, setStory] = useState(data[0]);
  const thumbnail = story.thumbnail ? story.thumbnail.path + "." + story.thumbnail.extension : imgNotFound;

  useEffect(() => {
    console.log(story);
  }, []);

  return (
    <div className="my-2 px-2 w-full min-h-screen overflow-hidden min-[2560px]:w-[2000px]">
      <h1 className="relative bg-neutral-800 mb-2 flex items-center justify-center uppercase text-center text-white text-lg pt-1 w-full min-[2560px]:h-24 min-[2560px]:text-3xl corner">
        {story.title}
      </h1>

      <div className="w-full block md:flex md:gap-3">
        <aside className={`asideItem`}>
          <Image
            src={thumbnail && thumbnail}
            width={400}
            height={500}
            alt={"Image of " + story.title}
            className="w-full h-full border-b-4 md:border-b-0 border-neutral-800 bg-red-600 pb-1 md:pb-3"
            priority
          />
        </aside>

        <section className="relative my-2 overflow-hidden md:w-3/5">
          <h6 className="text-xs text-neutral-400 mb-2 min-[2560px]:text-2xl">Modified: {story.modified.split("T")[0]}</h6>

          <article className="flex flex-col mb-2">
            <h2 className="text-lg font-bold min-[2560px]:text-4xl">Name: </h2>
            <p className="p-1 ml-1 min-[2560px]:text-3xl min-[2560px]:p-6">{story.title}</p>
          </article>

          <article className="flex flex-col mb-2 md:min-h-[265px]">
            <h2 className="text-lg font-bold min-[2560px]:text-4xl">Description: </h2>
            <p className="p-1 ml-1 min-[2560px]:text-3xl min-[2560px]:p-6">
              {story.description ? story.description : "There is no description yet for " + story.title + "."}
            </p>
          </article>

          <Article type="Type" data={story.type} path="tv-shows" />

          <Article type="Creators" data={story.creators.available} path="tv-shows" />

          <Article type="Characters" data={story.characters.available} path="tv-shows" />

          <Article type="Comics" data={story.comics.available} path="tv-shows" />

          <Article type="Events" data={story.events.available} path="tv-shows" />
        </section>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { storyId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(privatekey as string, "stories", Number(storyId));
  const story = await apiById.getData();

  return {
    props: {
      data: story.results,
    },
  };
};

export default Story;
