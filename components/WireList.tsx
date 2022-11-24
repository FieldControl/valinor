import { ReactElement } from "react";
import img from "../assets/images/marvel-field.png";
import Image from "next/image";

const WireList = () => {
  const item: ReactElement[] = [];

  for (let i = 0; i < 12; i++) {
    item.push(
      <li key={i}>
        <div className="cardResponsive corner overflow-hidden animate-pulse opacity-50">
          <div className="absolute w-full z-10 h-full overflow-hidden bg-neutral-800 hover:transition-all">
            <Image
              src={img}
              alt={"Image Marvel Field"}
              width={300}
              height={300}
              className="w-full h-[85%] hover:scale-105 transition-all border-b-4 border-red-600"
              priority={true}
            />
          </div>
          <div className="w-full h-[15%] z-30 flex flex-col justify-between overflow-hidden text-white p-1 absolute bottom-0"></div>
        </div>
      </li>
    );
  }

  return <ul className="w-full h-auto flex flex-wrap justify-between relative">{item}</ul>;
};
export default WireList;
