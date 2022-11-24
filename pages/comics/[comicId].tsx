import { GetServerSideProps } from "next";
import { useApiSearchById } from "../../libs/useApiSearchById";
import { useState } from "react";
import { ItemProps } from "../../interfaces/ItemProps";
import Article from "../../components/Article";
import Profile from "../../components/Profile";

const Comic = ({ data }: ItemProps) => {
  const [comic, setComic] = useState(data[0]);

  return (
    <Profile type="comics" data={data}>
      <Article type="Format" data={comic.format} path="comics" />

      <Article type="Page Count" data={comic.pageCount} path="comics" />
    </Profile>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { comicId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(privatekey as string, "comics", Number(comicId));
  const comic = await apiById.getData();

  return {
    props: {
      data: comic.results,
    },
  };
};

export default Comic;
