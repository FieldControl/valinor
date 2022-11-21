import Image from "next/image";

type CardProps = {
  img: string;
  title: string;
};

const Card = ({ img, title }: CardProps) => {
  return (
    <div className="w-60 h-80 relative m-2 bg-neutral-800 corner">
      <div className="absolute w-60 z-10 h-[260] overflow-hidden bg-red-600 hover:animate-[growTall_.15s_linear_forwards] hover:transition-all">
        <Image
          src={img}
          alt={title}
          width={300}
          height={300}
          className="w-60 h-[260px] hover:scale-105 transition-all border-b-4 border-red-600"
        />
      </div>
      <div className="w-full h-[60px] z-30 overflow-hidden text-white p-1 absolute bottom-0">
        <span className="bg-transparent">{title}</span>
      </div>
    </div>
  );
};

export default Card;
