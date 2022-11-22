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
  const thumbnail = character.thumbnail
    ? character.thumbnail.path + "." + character.thumbnail.extension
    : imgNotFound;
  const [accordion, setAccordion] = useState("");

  const handleAccordion = (value: string) => {
    if (value === accordion) setAccordion("");
    else setAccordion(value);
  };

  return (
    <div className="m-2">
      <h1 className="relative bg-neutral-800 my-1 uppercase text-center text-white text-2xl pt-1 w-full corner">
        {character.name}
      </h1>
      <aside className="relative w-full bg-neutral-300 h-72 z-20">
        <Image
          src={thumbnail && thumbnail}
          width={400}
          height={500}
          alt={"Image of " + character.name}
          className="w-full h-full"
          priority
        />
      </aside>
      <section className="my-2 overflow-hidden">
        <h6 className="text-xs text-neutral-400 mb-2">
          Modified: {character.modified.split("T")[0]}
        </h6>
        <article
          className={`w-full overflow-hidden relative ${
            accordion === "description" ? "h-auto" : "h-7"
          } animate-growHeight`}
        >
          <h2
            className="titleOfInfo"
            onClick={() => handleAccordion("description")}
          >
            <span className="text-white">Description:</span>
          </h2>
          <p className="my-2 p-2">
            {character.description === ""
              ? "There is no description yet for " + character.name
              : character.description}
          </p>
        </article>

        <h2 className="titleOfInfo">
          <span className="text-white">Comics:</span>
        </h2>
        <p>{character.description}</p>
        <h2 className="titleOfInfo">
          <span className="text-white">Events:</span>
        </h2>
        <p>{character.description}</p>
        <h2 className="titleOfInfo">
          <span className="text-white">Series:</span>
        </h2>
        <p>{character.description}</p>
        <h2 className="titleOfInfo">
          <span className="text-white">Stories:</span>
        </h2>
        <p>{character.description}</p>
      </section>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { characterId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(
    privatekey as string,
    "characters",
    Number(characterId)
  );
  const character = await apiById.getData();

  return {
    props: {
      data: character.results,
    },
  };
};

export default Character;
