import { Image } from "../Image";
import Search from "../Search";
import Logo from "/logo-github.png";

export default function Header() {
  return (
    <header className="pt-5 flex flex-col sm:flex-row items-center justify-between p-[15px] gap-5 bg-black">
      <div className="flex items-center gap-5">
        <Image src={Logo} alt="Logo Github" className="rounded-full w-10 invert" />
        <span className="text-white text-lg font-semibold">GitHub Search Repo</span>
      </div>
      <div className="flex items-center gap-5 flex-col sm:flex-row">
        <Search />
        <Image
          src="https://avatars.githubusercontent.com/u/71036610?v=4"
          alt="Avatar Rebecca"
          className="rounded-full w-10"
        />
      </div>
    </header>
  );
}
