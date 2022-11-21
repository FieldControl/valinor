import Image from "next/image";
import { Event } from "../../interfaces/Event";
import { useApi } from "../../libs/useApi";
import { GetServerSideProps } from "next";
import Content from "../../components/Content";

type CharactersProps = {
  privatekey: string;
  data: Event[];
  total: number;
};

const Events = ({ privatekey, data, total }: CharactersProps) => {
  return (
    <Content type="events" privatekey={privatekey} data={data} total={total} />
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const privatekey = process.env.API_PRIVATE_KEY;
  const api = useApi(privatekey as string, "events");

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
