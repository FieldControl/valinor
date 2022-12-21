import { Footer } from "../../components/Footer";
import { PersonList } from "../../components/PersonList";

export default function details() {
  return (
    <main
      id="main"
      className="flex justify-center items-center flex-col h-full w-full bg-backGround-body"
    >
      <PersonList></PersonList>
      <Footer></Footer>
    </main>
  );
}
