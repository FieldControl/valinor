import { GetServerSideProps } from "next";
import Image from "next/image";
import { useApiSearchById } from "../../libs/useApiSearchById";
import imgNotFound from "../../assets/images/image_not_available.jpg";
import { useState } from "react";
import { ItemProps } from "../../interfaces/ItemProps";
import Article from "../../components/Article";

const Event = ({ data }: ItemProps) => {
  const [event, setEvent] = useState(data[0]);
  const thumbnail = event.thumbnail ? event.thumbnail.path + "." + event.thumbnail.extension : imgNotFound;

  return (
    <div className="my-2 px-2 w-full min-h-screen overflow-hidden min-[2560px]:w-[2000px]">
      <h1 className="relative bg-neutral-800 mb-2 flex items-center justify-center uppercase text-center text-white text-2xl pt-1 w-full min-[2560px]:h-24 min-[2560px]:text-6xl corner">
        {event.title}
      </h1>

      <div className="w-full block md:flex md:gap-3">
        <aside className={`asideItem`}>
          <Image
            src={thumbnail && thumbnail}
            width={400}
            height={500}
            alt={"Image of " + event.title}
            className="w-full h-full border-b-4 md:border-b-0 border-neutral-800 bg-red-600 pb-1 md:pb-3"
            priority
          />
        </aside>

        <section className="relative my-2 overflow-hidden md:w-3/5">
          <h6 className="text-xs text-neutral-400 mb-2 min-[2560px]:text-2xl">Modified: {event.modified.split("T")[0]}</h6>

          <article className="flex flex-col mb-2">
            <h2 className="text-lg font-bold min-[2560px]:text-4xl">Name: </h2>
            <p className="p-1 ml-1 min-[2560px]:text-3xl min-[2560px]:p-6">{event.title}</p>
          </article>

          <article className="flex flex-col mb-2 md:min-h-[265px] min-[2560px]:min-h-[40rem]">
            <h2 className="text-lg font-bold min-[2560px]:text-4xl">Description: </h2>
            <p className="p-1 ml-1 min-[2560px]:text-3xl min-[2560px]:p-6">
              {event.description ? event.description : "There is no description yet for " + event.name + "."}
            </p>
          </article>

          <Article type="More" data={0} path="videos" />
        </section>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(privatekey as string, "events", Number(eventId));
  const event = await apiById.getData();

  return {
    props: {
      data: event.results,
    },
  };
};

export default Event;
