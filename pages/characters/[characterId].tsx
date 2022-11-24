import { GetServerSideProps } from "next";
import { useApiSearchById } from "../../libs/useApiSearchById";
import { useState } from "react";
import { ItemProps } from "../../interfaces/ItemProps";
import Article from "../../components/Article";
import Profile from "../../components/Profile";

const Character = ({ data }: ItemProps) => {
  const [character, setCharacter] = useState(data[0]);

  return (
    <Profile type="characters" data={data}>
      <Article type="comics" data={character.comics.available} path="comics" />

      <Article type="events" data={character.events.available} path="videos" />

      <Article type="series" data={character.series.available} path="tv-shows" />

      <Article type="stories" data={character.stories.available} path="movies" />
    </Profile>
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
