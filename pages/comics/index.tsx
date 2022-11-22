import Image from "next/image";
import { Artefact } from "../../interfaces/Artefact";
import { GetServerSideProps } from "next";
import Content from "../../components/Content";
import { useApiObjects } from "../../libs/useApiObjects";

type ComicsProps = {
  privatekey: string;
  data: Artefact[];
  total: number;
};

const Comics = ({ privatekey, data, total }: ComicsProps) => {
  return <Content type="comics" privatekey={privatekey} data={data} total={total} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const privatekey = process.env.API_PRIVATE_KEY;
  const api = useApiObjects(privatekey as string, "comics");

  const comics = await api.getData();
  const total = comics.total;

  return {
    props: {
      privatekey,
      data: comics.results,
      total,
    },
  };
};

export default Comics;
