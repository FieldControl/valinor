"use client"
import Image from 'next/image'
import Link from 'next/link'
import Gif404 from '../public/404.gif'

// paginão 404 não encontrada
export default function PageNotFount() {
    return (
        <div className="w-full h-screen">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Image
                    className="relative left-1/2 -translate-x-1/2"
                    src={Gif404}
                    height={300}
                    width={300}
                    alt={"página não encontrada"}
                    quality={100}
                    aria-label="git de um gato em uma caixa"
                />
                <p className="block text-center text-4xl font-bold text-blue-600">Opops! Página não encontrada</p>
                <Link className="block text-center py-4" href={'/'}>Clique aqui para voltar a página inicial</Link>
            </div>
        </div>
    )
}