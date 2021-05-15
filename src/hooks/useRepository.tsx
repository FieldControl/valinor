import {
  createContext,
  useState,
  useEffect,
  useContext,
  FormEvent,
} from "react";
import { api } from '../services/api';
import { toast } from 'react-toastify'

interface RepositoryProps {
  full_name: string;
  id: number;
  html_url: string;
  description: string;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string;
}

interface Repository {
  items: RepositoryProps[];
}

interface RepositoryData {
  Repositories: RepositoryProps[];
  RepositoriesCard: RepositoryProps[];
  textInput: string;
  textInputDashboard: string;
  setTextInput: React.Dispatch<React.SetStateAction<string>>
  setTextInputDashboard: React.Dispatch<React.SetStateAction<string>>
  handleAddRepository: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}


const RepositoryContext = createContext<RepositoryData>({} as RepositoryData);


export const RepositoryProvider: React.FC = ({ children }) => {
  const [textInput, setTextInput] = useState('');
  const [textInputDashboard, setTextInputDashboard] = useState('');
  const [Repositories, setRepositories] = useState<RepositoryProps[]>([]);
  const [RepositoriesCard, setRepositoriesCard] = useState<RepositoryProps[]>(() => {
    const storageRepository = localStorage.getItem(
      '@GitHubCard:repositories',
    );

    if (storageRepository) {
      return JSON.parse(storageRepository);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      '@GitHubCard:repositories',
      JSON.stringify(RepositoriesCard),
    );
  }, [RepositoriesCard]);



  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!textInputDashboard) {
      toast.info(' Pesquisa Vazia', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      await api.get<Repository>(`repositories?q=${textInputDashboard}&per_page=5`)
        .then((response: any) => setRepositoriesCard(response.data.items))

      setTextInputDashboard('');

    } catch (err) {
      throw new Error(err);
    }
  }

  useEffect(() => {
    async function SearchList() {
      try {
        if (textInput !== '') {
          await api.get<Repository>(`repositories?q=${textInput}&page=1&per_page=8`)
            .then((response: any) => setRepositories(response.data.items))
        }
      } catch (err) {
        return;
      }
    }
    SearchList()

  }, [textInput]);

  return (
    <RepositoryContext.Provider value={
      {
        setTextInputDashboard,
        Repositories,
        RepositoriesCard,
        setTextInput,
        textInput,
        textInputDashboard,
        handleAddRepository
      }}>
      {children}
    </RepositoryContext.Provider>
  )
}

export function useRepository() {
  const context = useContext(RepositoryContext)

  return context;
}