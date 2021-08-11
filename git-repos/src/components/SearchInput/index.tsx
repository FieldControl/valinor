import { AiOutlineLoading, AiOutlineSearch } from 'react-icons/ai';

import './styles.scss';

interface SearchInputProps {
  isLoading?: boolean;
  value: string;
  onChange: (text: string) => void;
  onClick: () => void;
}

export function SearchInput({
  isLoading = false,
  onChange,
  onClick,
  value,
}: SearchInputProps): JSX.Element {
  return (
    <div className="search-box">
      <input
        onChange={e => onChange(e.target.value)}
        placeholder="Pesquise por um repositório"
        value={value}
      />
      <button type="button" onClick={onClick}>
        {isLoading ? (
          <AiOutlineLoading className="loading" size={30} color="#ffffff" />
        ) : (
          <AiOutlineSearch size={30} color="#ffffff" />
        )}
      </button>
    </div>
  );
}
