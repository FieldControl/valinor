import Image from "next/image";
import imgNotFound from "../../assets/images/image_not_available.jpg";
// http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg

type CardProps = {
  img: string;
  title: string;
  modified: string;
};

const Card = ({ img, title, modified }: CardProps) => {
  return (
    <div className="w-52 h-80 relative m-2 bg-neutral-800 corner">
      <div className="absolute w-52 z-10 h-[260] overflow-hidden bg-red-600 hover:animate-[growTall_.15s_linear_forwards] hover:transition-all">
        <Image
          src={img || imgNotFound}
          alt={"Image - " + title}
          width={300}
          height={300}
          className="w-60 h-[260px] hover:scale-105 transition-all border-b-4 border-red-600"
          priority={true}
        />
      </div>
      <div className="w-full h-[60px] z-30 flex flex-col justify-between overflow-hidden text-white p-1 absolute bottom-0">
        <span className="bg-transparent">{title}</span>
        <span className="text-xs text-neutral-500">{`Modified: ${modified?.split("T")[0]}`}</span>
      </div>
    </div>
  );
};

export default Card;
