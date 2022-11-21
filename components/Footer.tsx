const Footer = () => {
  return (
    <footer className="bg-neutral-800 w-full py-2 mt-2">
      <div className="m-auto flex items-center justify-between border-b-8 border-red-600">
        <div className="container w-full m-auto flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-4xl -mb-2 text-center text-white uppercase">
              MARVEL
            </span>
            <span className="text-center text-white uppercase">
              FIELD CONTROL
            </span>
          </div>

          <div>
            <span className="text-lg text-white">
              Developed by &copy; Adalberto R. Teixeira
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
