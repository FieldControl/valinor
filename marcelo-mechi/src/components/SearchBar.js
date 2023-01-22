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
                <input className="border-2 rounded-l" value={term} onChange={handleChange} placeholder='Enter username' spellCheck={false} />
                <button className="border font-medium p-1.5 bg-gray-200 rounded-r">Search!</button>
            </form>
        </div >
    )
}

export default SearchBar;