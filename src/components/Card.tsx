import Image from "next/image"
import Link from "next/link";
import { Eye, GitFork, Star } from "phosphor-react";
import { RepositorioType } from "../pages/search"
import LanguageImage from "./LanguageImage";

export default function Card(repositorio: RepositorioType) {
    const src = repositorio.owner.avatar_url;
    return (
        <div className="border-2 border-gray-800 rounded-xl flex flex-col justify-between items-center w-[300px] sm:w-[400px] lg:w-[350px] h-[300px]">
            <div className="flex flex-row gap-6 p-4 ">
                <div className="flex flex-col items-start gap-4 ">
                    <Image
                        loader={() => src}
                        src={src}
                        alt="avatar"
                        width={50}
                        height={50}
                        className="rounded-full"
                        unoptimized={true}
                    />
                    <div className="flex items-center gap-2">
                        <Star size={20} />
                        <p>{repositorio.stargazers_count}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <GitFork size={20} />
                        <p>{repositorio.forks_count}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye size={20} />
                        <p>{repositorio.watchers_count}</p>
                    </div>

                    {repositorio.language && (
                        <div className="flex items-center gap-2 text-xs sm:text-base">
                        <LanguageImage language={`${repositorio.language}`} />
                        <p>{repositorio.language}</p>
                    </div>
                    )}
                    
                </div>

                <div className="flex flex-col items-center w-[140px] xl:w-[180px] gap-4 overflow-hidden ">
                    <h1 className="text-xl xl:text-2xl font-semibold text">{repositorio.name}</h1>
                    {repositorio.description && (
                        <p className="text-gray-400 text-xs text-clip text-left border-2 border-gray-800 rounded-lg p-2 w-[140px] xl:w-[180px] max-h-[150px]">{repositorio.description}</p>
                    )}
                    
                </div>

            </div>
            <Link href={repositorio.html_url} target={"_blank"} className="text-blue-400 hover:underline ">Acessar repositório</Link>
        </div>
    )
}
