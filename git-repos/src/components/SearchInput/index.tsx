import { AiOutlineLoading, AiOutlineSearch } from 'react-icons/ai';

import './styles.scss';

interface SearchInputProps {
  isLoading?: boolean;
  value: string;
  onChange: (text: string) => void;
  onClick: () => void;
}

const handleKeyPress = (
  e: React.KeyboardEvent<HTMLInputElement>,
  onKeyPress: () => void
): void => {
  if (e.code === 'Enter') {
    onKeyPress();
  }
};

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
        onKeyPress={e => handleKeyPress(e, onClick)}
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
