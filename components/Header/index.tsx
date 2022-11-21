import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Header = () => {
  const params = useRouter();

  return (
    <header className="bg-[#202020] w-full h-16 flex flex-col">
      <div className="flex flex-col items-center">
        <nav>
          <ul className="flex items-center gap-20 uppercase text-white text-lg">
            <li
              className={`menu-item-style ${
                params.pathname === "/characters" && "text-white border-red-600"
              }`}
            >
              <Link href="/characters">Characters</Link>
            </li>
            <li
              className={`menu-item-style ${
                params.pathname === "/comics" && "text-white border-red-600"
              }`}
            >
              <Link href="/comics">Comics</Link>
            </li>
            <li
              className={`menu-item-style ${
                params.pathname === "/creators" && "text-white border-red-600"
              }`}
            >
              <Link href="/creators">Creators</Link>
            </li>
            <li className="bg-[#ec1d24] w-[105px]">
              <Link href="/">
                <h1 className=" text-5xl text-white text-center">MARVEL</h1>
                <h3 className="text-white text-xl -mt-3 text-center">
                  Field Control
                </h3>
              </Link>
            </li>
            <li
              className={`menu-item-style ${
                params.pathname === "/events" && "text-white border-red-600"
              }`}
            >
              <Link href="/events">Events</Link>
            </li>
            <li
              className={`menu-item-style ${
                params.pathname === "/series" && "text-white border-red-600"
              }`}
            >
              <Link href="/series">Series</Link>
            </li>
            <li
              className={`menu-item-style ${
                params.pathname === "/stories" && "text-white border-red-600"
              }`}
            >
              <Link href="/stories">Stories</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
