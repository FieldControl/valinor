import Image from "next/image";
import imgNotFound from "../assets/images/image_not_available.jpg";

type CardProps = {
  img: string;
  title: string;
  modified: string;
};

const Card = ({ img, title, modified }: CardProps) => {
  return (
    <div className="cardResponsive corner overflow-hidden">
      <div className={`absolute w-full z-10 h-full overflow-hidden bg-neutral-800 hover:transition-all`}>
        <Image
          src={img || imgNotFound}
          alt={"Image - " + title}
          width={300}
          height={300}
          className="w-full h-[85%] hover:scale-105 transition-all border-b-4 border-red-600"
          priority={true}
        />
      </div>
      <div className="w-full h-[15%] z-30 flex flex-col justify-between overflow-hidden text-white p-1 absolute bottom-0">
        <span className="bg-transparent h-full">{title}</span>
        <span className="text-xs text-neutral-500">{`Modified: ${modified?.split("T")[0]}`}</span>
      </div>
    </div>
  );
};

export default Card;
