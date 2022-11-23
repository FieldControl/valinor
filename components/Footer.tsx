const Footer = () => {
  return (
    <footer className="bg-neutral-800 w-full py-2 ">
      <div className="m-auto px-4 flex items-center justify-between">
        <div className="container w-full m-auto flex justify-between items-center">
          <div className="flex flex-col w-1/3">
            <span className="text-3xl md:text-4xl -mb-2 text-white uppercase min-[2560px]:text-6xl">MARVEL</span>
            <span className=" text-xs md:text-base text-white uppercase ml-1 min-[2560px]:text-2xl min-[2560px]:ml-3">FIELD CONTROL</span>
          </div>

          <div className="w-2/3 flex flex-col">
            <span className="text-xs md:text-lg lg:text-2xl text-right text-white">Developed by &copy; Adalberto R. Teixeira</span>
            <span className="text-xs md:text-sm lg:text-xl text-right text-neutral-500">
              Data provided by Marvel. © {new Date().getFullYear()} MARVEL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
