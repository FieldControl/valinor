import { BiShow, BiStar } from "react-icons/bi";

function RepoCard({ name, description, watchers, repoUrl, stars }) {

    return (
        <div className="flex flex-col">
            <div>
                {/* Nome do repo */}
                <h2 className="text-lg font-semibold text-gray-800">{name}</h2>

                {/* Descrição do repo */}
                <section className="repo-description text-justify">
                    {description}
                </section>
            </div>

            <div>
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
                <div className="flex flex-row-reverse">
                    <a className="text-sm font-medium hover:text-white bg-gray-300 hover:bg-gray-600 rounded px-2" href={repoUrl}>
                        Visitar Repo
                    </a>
                </div>
            </div>
        </div>
    )
}

export default RepoCard;