import { GetServerSideProps } from "next";
import Content from "../../components/Content";
import { useApiObjects } from "../../libs/useApiObjects";
import { Artefact } from "../../interfaces/Artefact";

type SeriesProps = {
  privatekey: string;
  data: Artefact[];
  total: number;
};

const Series = ({ privatekey, data, total }: SeriesProps) => {
  return <Content type="series" privatekey={privatekey} data={data} total={total} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const privatekey = process.env.API_PRIVATE_KEY;
  const api = useApiObjects(privatekey as string, "series");

  const series = await api.getData();
  const total = series.total;

  return {
    props: {
      privatekey,
      data: series.results,
      total,
    },
  };
};

export default Series;
