import { useState } from 'react'
import Input from './Input'
import { useRouter } from 'next/router';

export default function Navbar() {
    const [search, setSearch] = useState("");

    const router = useRouter()

    const handlesubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!search) return;

        router.push(`/search?q=${search}`)
    }

    return (
            <form onSubmit={handlesubmit} className='flex flex-col sm:flex-row items-center gap-4 '>
                <Input name='input' id='input' placeholder='Pesquise no Github...' onChange={(e) => setSearch(e.target.value)} value={search} />
                <button
                    type="submit"
                    className="bg-header px-5 rounded-md font-semibold flex items-center gap-3 pointer-events-auto hover:bg-gray-800 h-[46px]"
                >
                    Buscar
                </button>

            </form>
    )
}