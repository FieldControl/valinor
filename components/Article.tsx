import { useState } from "react";
import { ItemProps } from "../interfaces/ItemProps";

type ArticleProps = {
  type: string;
  data: number | string;
  path: string;
};

const Article = ({ type, data, path }: ArticleProps) => {
  const [accordion, setAccordion] = useState("");

  const handleAccordion = (value: string) => {
    if (value === accordion) setAccordion("");
    else setAccordion(value);
  };

  return (
    <article className={`w-full mb-2 overflow-hidden`}>
      <h2 className="titleOfInfo" onClick={() => handleAccordion(type)}>
        <span className="text-white uppercase tracking-[.15em] leading-8">{type}:</span>
      </h2>

      <div
        className={`opacity-0  ${
          accordion === type ? "my-2 p-1 pl-2 h-auto opacity-100" : "h-0"
        } transition-all duration-500 min-[2560px]:text-3xl min-[2560px]:p-6`}
      >
        {data || data === 0 ? (
          <dl className="flex flex-col gap-3 min-[2560px]:gap-6">
            <data className="flex">
              <dt className="font-bold w-1/3">Available: </dt>
              <dd className="w-2/3 font-bold capitalize">{data}</dd>
            </data>
            <data className="flex">
              <dt className="font-bold w-1/3">Collections: </dt>
              <dd className="w-2/3">
                <a
                  href={"https://www.marvel.com/" + path}
                  className="uppercase bg-red-600 text-white rounded-lg p-1 text-sm shadow-md shadow-neutral-600 hover:scale-105 active:scale-95"
                >
                  Access all
                </a>
              </dd>
            </data>
          </dl>
        ) : (
          "There is no " + type + " yet."
        )}
      </div>
    </article>
  );
};

export default Article;
