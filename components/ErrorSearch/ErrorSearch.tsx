"use client"
import Image from 'next/image'
import Forbiden from '../../public/acesso-negado.png'

export function ErrorSearch() {
    return (
        <>
            <div className="absolute py-16 left-1/2 -translate-x-1/2">
                <Image
                    className="relative left-1/2 -translate-x-1/2"
                    src={Forbiden}
                    height={300}
                    width={300}
                    alt={"erro ao buscao"}
                    quality={100}
                    aria-label="foto de um erro"
                />
                <p className="text-4xl font-bold text-blue-600 text-center">Ops! Ocorreu um erro ao pesquisar</p>
            </div>
        </>
    )
}