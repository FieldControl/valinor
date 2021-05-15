import {
  createContext,
  useState,
  useEffect,
  useContext,
  FormEvent,
} from "react";
import { toast } from 'react-toastify'
import { api } from "../services/api";

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
  total_count: number;
  items: RepositoryProps[];
}

interface RepositoryData {
  textInput: string;
  textInputDashboard: string;
  setTextInput: React.Dispatch<React.SetStateAction<string>>
  setTextInputDashboard: React.Dispatch<React.SetStateAction<string>>
  handleAddRepository: (event: FormEvent<HTMLFormElement>) => void;
  Pageinfo: Repository | undefined;
  LIMIT: number;
}


const RepositoryContext = createContext<RepositoryData>({} as RepositoryData);


export const RepositoryProvider: React.FC = ({ children }) => {
  const LIMIT = 8;
  const [textInput, setTextInput] = useState('');
  const [textInputDashboard, setTextInputDashboard] = useState('');
  const [Pageinfo, setPageinfo] = useState<Repository>();


    function handleAddRepository(
    event: FormEvent<HTMLFormElement>) {
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
       fetch (`${api}repositories?q=${textInputDashboard}&per_page=8`)
        .then(response => response.json())
        .then((response: any) => setPageinfo(response))

      } catch (err) {
        throw new Error(err);
      }
   
  }

  useEffect(() => {
    async function SearchList() {
      try {
        if (textInput !== '') {
          fetch (`${api}repositories?q=${textInput}&page=1&per_page=8`)
            .then((response: any) => response.json())
            .then((response: any) => setPageinfo(response))
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
        textInputDashboard,
        LIMIT,
        Pageinfo,
        textInput,
        setTextInputDashboard,
        setTextInput,
        handleAddRepository,
      }}>
      {children}
    </RepositoryContext.Provider>
  )
}

export function useRepository() {
  const context = useContext(RepositoryContext)

  return context;
}