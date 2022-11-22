import { GetServerSideProps } from "next";
import Content from "../../components/Content";
import { Artefact } from "../../interfaces/Artefact";
import { useApiCharacters } from "../../libs/useApiCharacters";

type EnentsProps = {
  privatekey: string;
  data: Artefact[];
  total: number;
};

const Events = ({ privatekey, data, total }: EnentsProps) => {
  return <Content type="events" privatekey={privatekey} data={data} total={total} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const privatekey = process.env.API_PRIVATE_KEY;
  const api = useApiCharacters(privatekey as string, "events");

  const events = await api.getData();
  const total = events.total;

  return {
    props: {
      privatekey,
      data: events.results,
      total,
    },
  };
};

export default Events;
