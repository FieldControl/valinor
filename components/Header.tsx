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
    <header className="w-full h-16 flex flex-col min-[2560px]:h-24 overflow-hidden">
      <div className="fixed z-50 top-0 bg-neutral-800  w-full h-auto flex flex-col">
        <div className="container flex flex-col items-center w-full m-auto">
          <nav className="w-full">
            <ul className="flex w-full items-center justify-center md:justify-around uppercase gap-8 lg:gap-10 text-white text-md">
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
              <li className="bg-[#ec1d24] h-16 w-[80px] min-[2560px]:w-[140px] min-[2560px]:h-24">
                <Link href="/">
                  <h1 className=" text-4xl min-[2560px]:text-6xl text-white text-center pt-1">MARVEL</h1>
                  <h3 className="text-white text-base min-[2560px]:text-2xl -mt-3 text-center">Field Control</h3>
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

        <div
          className={`menuMobile absolute bg-neutral-800 top-16 w-full z-40 overflow-hidden md:hidden  ${
            showMenu ? "h-[410px] " : "h-0"
          } transition-all duration-500 ease-in-out`}
        >
          <nav className="my-3">
            <ul className="flex flex-col w-full h-full uppercase text-white text-lg" onClick={menuMobile}>
              <li className={`menu-mobile-item-style ${params.pathname === "/characters" && "text-white border-red-600"}`}>
                <Link href="/characters" className="w-full h-full flex items-center justify-center">
                  Characters
                </Link>
              </li>
              <li className={`menu-mobile-item-style ${params.pathname === "/comics" && "text-white border-red-600"}`}>
                <Link href="/comics" className="w-full h-full flex items-center justify-center">
                  Comics
                </Link>
              </li>
              <li className={`menu-mobile-item-style ${params.pathname === "/creators" && "text-white border-red-600"}`}>
                <Link href="/creators" className="w-full h-full flex items-center justify-center">
                  Creators
                </Link>
              </li>
              <li className={`menu-mobile-item-style ${params.pathname === "/events" && "text-white border-red-600"}`}>
                <Link href="/events" className="w-full h-full flex items-center justify-center">
                  Events
                </Link>
              </li>
              <li className={`menu-mobile-item-style ${params.pathname === "/series" && "text-white border-red-600"}`}>
                <Link href="/series" className="w-full h-full flex items-center justify-center">
                  Series
                </Link>
              </li>
              <li className={`menu-mobile-item-style ${params.pathname === "/stories" && "text-white border-red-600"}`}>
                <Link href="/stories" className="w-full h-full flex items-center justify-center">
                  Stories
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
