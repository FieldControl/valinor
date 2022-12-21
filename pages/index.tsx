import { Footer } from "../components/Footer";

export default function homePage() {
  return (
    <>
      <main className="h-full max-h-screen-2xl w-screen flex flex-1 flex-col items-center justify-start mt-40" id="home" >
        <figure aria-label="App Title ">
          <img src="https://fontmeme.com/permalink/221220/998b70df02845322a5564272980e0014.png" alt="SW WIKI Logo" />
        </figure>
        <h2 className="text-xl mt-8" id="subtitle/slogan">A Wiki about Star Wars Universe!</h2>
        <button className="text-lg mt-8 text-backGround-body font-bold bg-yellow p-2 px-8 rounded-md hover:opacity-40 focus:border-solid focus:border-white focus:border-2" type="button" aria-label="Enter Button" >
          <a href="/details">Enter</a>
        </button>
      </main>
      <div id="footer-container" className="flex  w-full fixed bottom-0">
        <Footer></Footer>
      </div>
    </>
  );
}