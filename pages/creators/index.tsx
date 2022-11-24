import { useApiCharacters } from "../../libs/useApiCharacters";
import { GetServerSideProps } from "next";
import Content from "../../components/Content";
import { Person } from "../../interfaces/Person";

type CreatorProps = {
  privatekey: string;
  data: Person[];
  total: number;
};

const Home = ({ privatekey, data, total }: CreatorProps) => {
  return <Content type="creators" privatekey={privatekey} data={data} total={total} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const privatekey = process.env.API_PRIVATE_KEY;
  const api = useApiCharacters(privatekey as string, "creators");

  const creators = await api.getData();
  const total = creators.total;

  return {
    props: {
      privatekey,
      data: creators.results,
      total,
    },
  };
};

export default Home;
