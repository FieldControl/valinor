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
    <div className="min-[320px]:w-64 min-[375px]:w-72 min-[425px]:w-[340px] min-[768px]:w-[260px] min-[1024px]:w-[230px] min-[1440px]:w-[280px] min-[2560px]:w-[350px] min-[2560px]:h-[450px] z-20 h-80 relative m-2 bg-neutral-800 corner">
      <div className="absolute w-full z-10 h-[260] min-[2560px]:h-[320px] overflow-hidden bg-red-600 hover:animate-[growTall_.15s_linear_forwards] hover:transition-all">
        <Image
          src={img || imgNotFound}
          alt={"Image - " + title}
          width={300}
          height={300}
          className="w-full h-[260px] min-[2560px]:h-[320px] hover:scale-105 transition-all border-b-4 border-red-600"
          priority={true}
        />
      </div>
      <div className="w-full h-[20%] z-30 flex flex-col justify-between overflow-hidden text-white md:text-lg lg:text-2xl p-1 absolute bottom-0">
        <span className="bg-transparent">{title}</span>
        <span className="text-xs text-neutral-500">{`Modified: ${modified?.split("T")[0]}`}</span>
      </div>
    </div>
  );
};

export default Card;
