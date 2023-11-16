"use client";

import { Dispatch, SetStateAction } from "react";

type Props = {
  highLights: Array<{ name: string }>;
  setInputQuery: Dispatch<SetStateAction<string>>;
};

export default function HighLight({ highLights, setInputQuery }: Props) {
  return (
    <div className="mt-16 flex flex-col justify-center px-4">
      <div className="mb-2 w-full border-b-2 border-gray-300/50 text-lg font-extrabold text-white">
        Destaques
      </div>
      <div className="flex">
        <section className="rounded-lg border  border-gray-600 bg-gray-800 p-4">
          <h1 className="text-md mb-4 font-bold text-white">
            Nomes de repositórios
          </h1>

          <div className="flex flex-row items-center space-x-8 flex-wrap space-y-4 md:space-y-0">
            {highLights.map((highlight, index) => (
              <button
                onClick={() => setInputQuery(highlight.name)}
                key={index}
                className="rounded-lg border border-gray-700 bg-gray-600 p-4 transition-all duration-300 hover:bg-gray-900/80"
              >
                <span className="text-md font-light text-white">
                  {highlight.name}
                </span>
              </button>
            ))}
          </div>

          <h1 className="mt-4 text-sm font-extralight text-white">
            Observação: é recomendável a visualização/visita desses repositórios acima.
          </h1>
        </section>
      </div>
    </div>
  );
}
