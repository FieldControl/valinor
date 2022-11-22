import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Header = () => {
  const params = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const menuMobile = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header className="bg-neutral-800 w-full h-16 flex flex-col">
      <div className="container flex flex-col items-center w-full m-auto">
        <nav className="w-full">
          <ul className="flex w-full items-center justify-center md:justify-around uppercase gap-10 lg:gap-10 text-white text-md">
            <li className="absolute left-5 md:hidden">
              <Image
                src={"/favicon.ico"}
                width={30}
                height={30}
                alt="Menu Icon"
                onClick={menuMobile}
                className={`${showMenu && "rotate-180"} transition-all`}
              />
            </li>
            <li className={`menu-item-style  ${params.pathname === "/characters" && "text-white border-red-600"}`}>
              <Link href="/characters">Characters</Link>
            </li>
            <li className={`menu-item-style  ${params.pathname === "/comics" && "text-white border-red-600"}`}>
              <Link href="/comics">Comics</Link>
            </li>
            <li className={`menu-item-style  ${params.pathname === "/creators" && "text-white border-red-600"}`}>
              <Link href="/creators">Creators</Link>
            </li>
            <li className="bg-[#ec1d24] w-[105px]">
              <Link href="/">
                <h1 className=" text-5xl text-white text-center">MARVEL</h1>
                <h3 className="text-white text-xl -mt-3 text-center">Field Control</h3>
              </Link>
            </li>
            <li className={`menu-item-style  ${params.pathname === "/events" && "text-white border-red-600"}`}>
              <Link href="/events">Events</Link>
            </li>
            <li className={`menu-item-style  ${params.pathname === "/series" && "text-white border-red-600"}`}>
              <Link href="/series">Series</Link>
            </li>
            <li className={`menu-item-style  ${params.pathname === "/stories" && "text-white border-red-600"}`}>
              <Link href="/stories">Stories</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className={`absolute bg-neutral-800 top-16 w-full z-40 overflow-hidden md:hidden ${showMenu ? "h-fit" : "h-0"} transition duration-500`}>
        <nav className="my-3">
          <ul className="flex flex-col w-full h-full uppercase text-white text-lg">
            <li className={`menu-mobile-item-style ${params.pathname === "/characters" && "text-white border-red-600"}`}>
              <Link href="/characters">Characters</Link>
            </li>
            <li className={`menu-mobile-item-style ${params.pathname === "/comics" && "text-white border-red-600"}`}>
              <Link href="/comics">Comics</Link>
            </li>
            <li className={`menu-mobile-item-style ${params.pathname === "/creators" && "text-white border-red-600"}`}>
              <Link href="/creators">Creators</Link>
            </li>
            <li className={`menu-mobile-item-style ${params.pathname === "/events" && "text-white border-red-600"}`}>
              <Link href="/events">Events</Link>
            </li>
            <li className={`menu-mobile-item-style ${params.pathname === "/series" && "text-white border-red-600"}`}>
              <Link href="/series">Series</Link>
            </li>
            <li className={`menu-mobile-item-style ${params.pathname === "/stories" && "text-white border-red-600"}`}>
              <Link href="/stories">Stories</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
