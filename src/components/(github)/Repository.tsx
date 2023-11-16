import { TRepository } from "@/types/repository";
import Image from "next/image";

type Props = {
  repository: TRepository;
  openModal: () => void;
};

// Este componente exibe informações detalhadas de um repositório específico.
export default function Repository({ repository, openModal }: Props) {
  const languageColors: { [key: string]: string } = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-400",
    Python: "bg-blue-600",
    Java: "bg-red-600",
    Kotlin: "bg-purple-600",
    PHP: "bg-purple-400",
    Ruby: "bg-pink-500",
    CSS: "bg-blue-300",
    Swift: "bg-orange-500",
    ObjectiveC: "bg-blue-800",
    C: "bg-gray-700",
    CSharp: "bg-green-800",
    Go: "bg-blue-200",
    CPlusPlus: "bg-blue-700",
    Scala: "bg-red-800",
    Shell: "bg-gray-400",
    PowerShell: "bg-blue-300",
    Dart: "bg-blue-500",
    Rust: "bg-orange-700",
    R: "bg-blue-600",
    Perl: "bg-pink-600",
    Lua: "bg-blue-500",
    Haskell: "bg-red-600",
    Julia: "bg-purple-600",
    SQL: "bg-pink-700",
    NoSQL: "bg-green-500",
    HTML: "bg-orange-400",
    Groovy: "bg-green-600",
    XML: "bg-red-500",
    Sass: "bg-pink-400",
    LESS: "bg-blue-400",
    JSON: "bg-yellow-600",
    YAML: "bg-yellow-300",
    Markdown: "bg-gray-500",
    Dockerfile: "bg-blue-300",
    Batch: "bg-gray-600",
  };

   // Função para formatar números (por exemplo, contagem de estrelas).
  function formatNumber(num: number) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  }

  // Função para calcular o tempo desde a última atualização.
  function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " anos atrás";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " meses atrás";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " dias atrás";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " horas atrás";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutos atrás";
    }
    return Math.floor(seconds) + " segundos atrás";
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4 flex flex-col md:flex-row justify-between items-center border border-gray-600">
      <div className="flex flex-row items-center mb-4 md:mb-0">
        {/* Icone do repositório */}
        <div className="mr-4">
          <Image
            src={`https://github.com/${repository.full_name.split("/")[0]}.png?size=40`}
            alt="Repository Icon"
            width={40}
            height={40}
          />
        </div>
        <div className="flex flex-col">
          {/* Nome do usuário/repositório */}
          <h3 className="text-white text-lg md:text-xl font-bold whitespace-normal break-words">
            {repository.full_name}
          </h3>
          {/* Descrição */}
          <p className="text-white text-sm md:text-base whitespace-normal break-words font-light">
            {repository.description}
          </p>
          {/* Tags de linguagem */}
          <div className="flex flex-wrap gap-2 mt-2">
            {repository.topics.map((topic) => (
              <span key={topic} className="bg-blue-100 text-blue-800 text-xs md:text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                {topic}
              </span>
            ))}
          </div>

          <section className="flex flex-col md:flex-row items-center space-x-0 md:space-x-4 mt-4">
            {/* Language */}
            <div className="flex justify-center items-center mb-2 md:mb-0">
              <span
                className={`h-2 w-2 rounded-full ${
                  languageColors[repository.language] || "bg-gray-300"
                }`}
              />
              <span className="text-white text-xs md:text-sm ml-2">
                {repository.language}
              </span>
            </div>

            {/* Contagem de estrelas e data do último commit */}
            <div className="flex justify-center items-center mb-2 md:mb-0">
              <span className="text-white font-light text-xs md:text-sm">
                Stars: {formatNumber(repository.stargazers_count)}
              </span>
            </div>

            {/* Data do último commit */}
            <div className="flex justify-center items-center">
              <span className="text-white font-light text-xs md:text-sm">
                Atualizado em {timeSince(new Date(repository.pushed_at))}
              </span>
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Contagem de estrelas */}
        <button
          onClick={openModal}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-xs md:text-sm"
        >
          Mais detalhes
        </button>
      </div>
    </div>
  );
}
