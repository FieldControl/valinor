import { GetServerSideProps } from "next";
import Image from "next/image";
import { Person } from "../../interfaces/Person";
import { useApiSearchById } from "../../libs/useApiSearchById";
import imgNotFound from "../../assets/images/image_not_available.jpg";
import { useState } from "react";

type CharacterProps = {
  data: [
    {
      comics: {};
      description: string;
      events: {};
      modified: string;
      name: string;
      series: {};
      stories: {};
      thumbnail: {
        path: string;
        extension: string;
      };
      urls: {};
    }
  ];
};

const Character = ({ data }: CharacterProps) => {
  const [character, setCharacter] = useState(data[0]);
  const thumbnail = character.thumbnail ? character.thumbnail.path + "." + character.thumbnail.extension : imgNotFound;
  return (
    <div className="m-2">
      <h1 className="relative bg-neutral-800 my-1 uppercase text-center text-white text-2xl pt-1 w-full corner">{character.name}</h1>
      <aside className="relative w-full bg-neutral-300 h-72 z-20">
        <Image src={thumbnail && thumbnail} width={400} height={500} alt={"Image of " + character.name} className="h-72" />
      </aside>
      <section className="my-2">
        <h6 className="text-xs text-neutral-400 -mt-1 mb-2">Modified: {character.modified.split("T")[0]}</h6>
        <h2 className="relative bg-neutral-500 h-5 my-2 font-bold uppercase ml-4 before:absolute before:w-10 before:-ml-4 before:h-5 before:bg-red-600 before:-z-10">
          <span className="text-white">Desc</span>ription:
        </h2>
        <p>{character.description}</p>
        <h2 className="relative bg-neutral-500 h-5 my-2 font-bold uppercase ml-4 before:absolute before:w-10 before:-ml-4 before:h-5 before:bg-red-600 before:-z-10">
          <span className="text-white">Comi</span>cs:
        </h2>
        <p>{character.description}</p>
        <h2 className="relative bg-neutral-500 h-5 my-2 font-bold uppercase ml-4 before:absolute before:w-10 before:-ml-4 before:h-5 before:bg-red-600 before:-z-10">
          <span className="text-white">Even</span>ts:
        </h2>
        <p>{character.description}</p>
        <h2 className="relative bg-neutral-500 h-5 my-2 font-bold uppercase ml-4 before:absolute before:w-10 before:-ml-4 before:h-5 before:bg-red-600 before:-z-10">
          <span className="text-white">Seri</span>es:
        </h2>
        <p>{character.description}</p>
        <h2 className="relative bg-neutral-500 h-5 my-2 font-bold uppercase ml-4 before:absolute before:w-10 before:-ml-4 before:h-5 before:bg-red-600 before:-z-10">
          <span className="text-white">Stor</span>ies:
        </h2>
        <p>{character.description}</p>
      </section>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { characterId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(privatekey as string, "characters", Number(characterId));
  const character = await apiById.getData();

  return {
    props: {
      data: character.results,
    },
  };
};

export default Character;
