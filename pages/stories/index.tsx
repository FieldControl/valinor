import Image from "next/image";
import { Event } from "../../interfaces/Event";
import { GetServerSideProps } from "next";
import Content from "../../components/Content";
import { useApiObjects } from "../../libs/useApiObjects";

type StoriesProps = {
  privatekey: string;
  data: Event[];
  total: number;
};

const Stories = ({ privatekey, data, total }: StoriesProps) => {
  return <Content type="stories" privatekey={privatekey} data={data} total={total} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const privatekey = process.env.API_PRIVATE_KEY;
  const api = useApiObjects(privatekey as string, "stories");

  const stories = await api.getData();
  const total = stories.total;

  return {
    props: {
      privatekey,
      data: stories.results,
      total,
    },
  };
};

export default Stories;
