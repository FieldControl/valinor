import { BiShow, BiStar } from "react-icons/bi";

function RepoCard({ name, description, watchers, repoUrl, stars }) {

    return (
        <div className="flex flex-col h-full place-content-between">
            <div>
                {/* Nome do repo */}
                <h2 className="text-lg font-semibold text-gray-800 leading-5">{name}</h2>

                {/* Descrição do repo */}
                <section className="repo-description text-justify mt-1 mb-2">
                    {description}
                </section>
            </div>

            <div className="flex flex-col justify-end">
                {/* Watcher e Stars */}
                <section className="flex flex-row gap-5">
                    <div className="flex flex-row items-center gap-0.5">
                        <BiShow className="h-3 text-gray-700" />
                        <span className="text-sm">{watchers}</span>
                    </div>
                    <div className="flex flex-row items-center gap-0.5">
                        <BiStar className="h-3 text-gray-700" />
                        <span className="text-sm">{stars}</span>
                    </div>
                </section>

                {/* Botão */}
                <div className="flex flex-row-reverse mt-1">
                    <a className="text-sm font-medium hover:text-white bg-gray-300 hover:bg-gray-600 rounded px-2" href={repoUrl}>
                        Visitar Repo
                    </a>
                </div>
            </div>
        </div>
    )
}

export default RepoCard;