import { MagnifyingGlass } from 'phosphor-react'
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

export default function Input(props: InputProps) {
    return (
        <div>
            <label className="relative block">
                <span className="sr-only">Search</span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <svg className="h-5 w-5 fill-slate-300" viewBox="0 0 20 20"><MagnifyingGlass size={20} color='white ' /></svg>
                </span>
                <input className="input placeholder:text-zinc-500 block border-2 border-gray-800 rounded-lg shadow-sm text-center focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm w-[250px] py-3 pl-[2rem] pr-[1rem] bg-background" type="text" name="search" {...props} maxLength={256}/>
            </label>
        </div>


    )
} 