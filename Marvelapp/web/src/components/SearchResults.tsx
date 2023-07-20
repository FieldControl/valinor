import React, { useState, useEffect, useCallback, KeyboardEvent, useRef } from 'react';
import api from '../Services/Api';
import { FcSearch } from 'react-icons/fc';
import Pagination from './Pagination';
import Modal from './CardModal';

type SearchResult = {
  id: string;
  name: string;
  title: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
};

type Props = {
  endpoint: string;
};

const SearchResults: React.FC<Props> = ({ endpoint }) => {
  const [text, setText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]); // Lista de resultados da API
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // Resultados filtrados pela pesquisa
  const [showResults, setShowResults] = useState(true); // Flag para exibir ou ocultar os resultados
  const [selectedCard, setSelectedCard] = useState<SearchResult | null>(null); // Cartão selecionado para exibir o modal
  const [currentPage, setCurrentPage] = useState(1); // Página atual da paginação
  const [totalPages, setTotalPages] = useState(0); // Total de páginas disponíveis
  const classListRef = useRef<HTMLDivElement>(null);
  const pesquisaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Função para buscar os resultados da API
    const fetchData = async () => {
      try {
        const response = await api.get(endpoint, {
          params: {
            offset: (currentPage - 1) * 20, // Cálculo do deslocamento com base na página atual
            limit: 20,
          },
        });
        const { results, total } = response.data.data;
        setResults(results); // Define os resultados retornados pela API
        setSearchResults(results); // Define os resultados filtrados inicialmente iguais aos resultados da API
        setTotalPages(Math.ceil(total / 20)); // Calcula o total de páginas com base no total de resultados
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [endpoint, currentPage]);

  const handleOnClick = useCallback(async () => {
    // Função para tratar o evento de clique no botão de pesquisa
    try {
      const response = await api.get(endpoint, {
        params: {
          titleStartsWith: text, // Parâmetro para filtrar por título iniciado pelo texto pesquisado
        },
      });

      setSearchResults(response.data.data.results); // Define os resultados filtrados pela pesquisa
      setShowResults(false); // Oculta os resultados anteriores
    } catch (error) {
      console.log(error);
    }
  }, [endpoint, text]);

  const handleTextChange = (value: string) => {
    // Função para tratar a alteração do texto da pesquisa
    setText(value);

    if (value === '') {
      setSearchResults([]); // Limpa os resultados filtrados se o texto estiver vazio
      setShowResults(true); // Exibe os resultados anteriores
    }
  };

  const handleMore = useCallback(async () => {
    // Função para carregar mais resultados da API
    try {
      const offset = results.length; // Calcula o deslocamento com base na quantidade atual de resultados
      const response = await api.get(endpoint, {
        params: { offset },
      });

      setResults(prevResults => [...prevResults, ...response.data.data.results]); // Adiciona os novos resultados à lista existente
    } catch (error) {
      console.log(error);
    }
  }, [endpoint, results]);

  const handleKeyPress = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    // Ativar pesquisa com a tecla enter
    if (event.key === 'Enter') {
      handleOnClick();
    }
  }, [handleOnClick]);

  const handleCardClick = (card: SearchResult) => {
    // Abre o modal
    setSelectedCard(card); 
  };

  const handleCloseModal = () => {
    // Fecha o modal
    setSelectedCard(null);
  };

  // Paginação
  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected + 1); // Define a nova página selecionada
    pesquisaRef.current?.scrollIntoView({ behavior: 'smooth' }); // Rola suavemente para a área de pesquisa
  };

  const areButtonsDisabled = text.length > 0;

  return (
    <main className="Container">
      <div className="pesquisa" ref={pesquisaRef}>
        <label id="Hero" htmlFor="pesquisa">
          Faça sua pesquisa!
        </label>
        <input
          type="text"
          placeholder="Nome"
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button disabled={!text} onClick={handleOnClick}>
          <FcSearch id="icon" />
        </button>
      </div>
      <div className="Classlist">
        {(showResults ? results : searchResults).map(result => (
          <div className="Card" key={result.id} onClick={() => handleCardClick(result)}>
            <div id="Cards">
              <img
                src={`${result.thumbnail.path}.${result.thumbnail.extension}`}
                alt={`Foto do ${result.title}`}
              />
            </div>
            <h2 className="name">{result.title}</h2>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {selectedCard && <Modal card={selectedCard} onClose={handleCloseModal} />}
    </main>
  );
};

export default SearchResults;