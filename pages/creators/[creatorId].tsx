import { GetServerSideProps } from "next";
import { useApiSearchById } from "../../libs/useApiSearchById";
import { useState } from "react";
import { ItemProps } from "../../interfaces/ItemProps";
import Article from "../../components/Article";
import Profile from "../../components/Profile";

const Creator = ({ data }: ItemProps) => {
  const [creator, setcreator] = useState(data[0]);

  return (
    <Profile type="creators" data={data}>
      <Article type="comics" data={creator.comics.available} path="comics" />

      <Article type="events" data={creator.events.available} path="videos" />

      <Article type="series" data={creator.series.available} path="tv-shows" />

      <Article type="stories" data={creator.stories.available} path="movies" />
    </Profile>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { creatorId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(privatekey as string, "creators", Number(creatorId));
  const creator = await apiById.getData();

  return {
    props: {
      data: creator.results,
    },
  };
};

export default Creator;
