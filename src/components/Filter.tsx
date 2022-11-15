interface FilterProps {
    filter: string;
    setFilter: (filter: string) => void;
}

export default function Filter({ filter, setFilter }: FilterProps) {
    return (
        <div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="p-2 rounded-md bg-background border-2 border-gray-800 h-[46px]">
                <option  value="stars">Mais relevantes</option>
                <option  value="">Mais recentes</option>
                <option  value="forks">Mais forks</option>
            </select>
        </div>
    )
}