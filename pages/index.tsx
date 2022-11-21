import Image from "next/image";
import { Character } from "../interfaces/Character";

const Home = () => {
  return <section>Pagina Home</section>;
};

// export const getStaticProps = async () => {
//   const privatekey = process.env.API_PRIVATE_KEY;
//   const api = useApi(privatekey as string, 0);

//   const characters = await api.getCharacters();
//   const offset = characters.offset;
//   const total = characters.total;

//   return {
//     props: {
//       privatekey,
//       characters: characters.results,
//       offset,
//       total,
//     },
//     revalidate: 3600 * 24,
//   };
// };

export default Home;
