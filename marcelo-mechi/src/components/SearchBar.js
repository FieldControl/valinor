import { useState } from "react";

function SearchBar({ onSubmit }) {
    const [term, setTerm] = useState('');


    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Mandando term de volta pro App
        onSubmit(term);
        // Apagando o username depois de pesquisar
        setTerm('');
    }

    const handleChange = (e) => {
        setTerm(e.target.value);
    }

    return (
        <div>
            <form className="flex" onSubmit={handleFormSubmit}>
                <input className="border-2 rounded-l" value={term} onChange={handleChange} placeholder='Escreva um username' spellCheck={false} />
                <button className="border font-medium p-1.5 hover:text-white bg-blue-300 hover:bg-blue-600 rounded-r">Procurar!</button>
            </form>
        </div >
    )
}

export default SearchBar;