import { useState } from "react";

function SearchBar({ onSubmit }) {
    const [term, setTerm] = useState('');


    const handleFormSubmit = (e) => {
        e.preventDefault();

        onSubmit(term);
    }

    const handleChange = (e) => {
        setTerm(e.target.value);
    }

    return (
        <div>
            <form onSubmit={handleFormSubmit}>
                <input className="border-2" value={term} onChange={handleChange} placeholder='Enter username' spellCheck={false} />
                <button>Search!</button>
            </form>
        </div >
    )
}

export default SearchBar;