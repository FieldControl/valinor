import { RepoCardProps } from "../@interfaces/IRepoCard";
import { formatDistanceToNow } from 'date-fns';

export default function RepoCard({
  full_name,
  owner,
  description,
  updated_at,
  watchers_count,
  language,
  topics,
  html_url
}: RepoCardProps) {
  // Converte a string de data para um objeto Date
  const updatedAtDate = new Date(updated_at);

  // Formata a data em extenso
  const formattedUpdatedAt = formatDistanceToNow(updatedAtDate, { addSuffix: true });

  return (
    <a href={html_url} title="Ir para o repositório" target="_blank">
        <div className="mb-4 w-full text-white m-auto block p-6 border border-gray-500 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <h5 className="flex flex-col sm:flex-row gap-3 text-white mb-2 text-2xl font-bold tracking-tight">
        <img src={owner.avatar_url} className="rounded-full mb-2 sm:mb-0" width="30" alt="Avatar" />
        <span>{full_name}</span>
      </h5>
      <p className="font-normal text-white dark:text-gray-400">
        {description}
      </p>
      <ul className="flex flex-wrap gap-2 pt-4">
        {topics.map((item, index) => (
          <li className="rounded-lg bg-blue-900 p-2" key={index}>
            {item}
          </li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row justify-between items-center text-gray-500 mt-4">
        <p className="mb-2 sm:mb-0">Ultima atualização: {formattedUpdatedAt}</p>
        <p className="mb-2 sm:mb-0">Stars: {watchers_count}</p>
        <p>{language}</p>
      </div>
    </div>
    </a>
  
  );
}
