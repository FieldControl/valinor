import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Loading from "../components/Loading";
import { Pagination } from "../components/Pagination";
import Filter from "../components/Filter";

export interface RepositorioType {
    id: number;
    name: string;  //nome 
    description: string; // descriçao 
    html_url: string; //link 
    owner: {
        avatar_url: string; //foto 
    };
    language: string; //linguagem
    stargazers_count: number; //estrelas
    forks_count: number; //forks
    watchers_count: number; //watchers           
}
export default function Search() {

    const searchParams = useSearchParams();

    const [repositorios, setRepositorios] = useState([]);

    const [offset, setOffset] = useState(0);

    const [total, setTotal] = useState(0);

    const [filter, setFilter] = useState('stars');

    const [removeLoading, setRemoveLoading] = useState(false);

    const search = searchParams.get('q');

    useEffect(() => {
        if (!search) return;
            const fetchRepositorios = async () => {
                const response = await fetch(`https://api.github.com/search/repositories?q=${search}&page=${offset}&per_page=9&sort=${filter}`);
                const data = await response.json();
                const total = data.total_count;
                setRepositorios(data.items);
                setTotal(total);
                setRemoveLoading(true);
            }
            fetchRepositorios();
    }, [search, offset, filter]);
    return (
        <div className="flex flex-col items-center mx-auto max-w-[1600px] border-b-[1px] border-b-gray-800">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around mt-4 mb-8 w-full">
                <Navbar />
                <Filter filter={filter} setFilter={setFilter} />
            </div>

            <div className="flex flex-col justify-center sm:justify-between items-center gap-6 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                {repositorios.map((repositorio: RepositorioType) => (
                    <Card {...repositorio} key={repositorio.id} />
                ))}
            </div>
            {!removeLoading && <Loading />}
            {repositorios.length > 0 && (
                <Pagination offset={offset} setOffset={setOffset} total={total} limit={9} />
            )}
        </div>
    )
}