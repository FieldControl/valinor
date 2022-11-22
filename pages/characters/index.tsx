import { Character } from "../../interfaces/Person";
import { useApiCharacters } from "../../libs/useApiCharacters";
import { GetServerSideProps } from "next";
import Content from "../../components/Content";

type CharactersProps = {
  privatekey: string;
  data: Character[];
  total: number;
};

const Characters = ({ privatekey, data, total }: CharactersProps) => {
  return <Content type="characters" privatekey={privatekey} data={data} total={total} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const privatekey = process.env.API_PRIVATE_KEY;
  const api = useApiCharacters(privatekey as string, "characters");

  const characters = await api.getData();
  const total = characters.total;

  return {
    props: {
      privatekey,
      data: characters.results,
      total,
    },
  };
};

export default Characters;
