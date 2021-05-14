import { 
  createContext,
  useState, 
  useEffect, 
  useCallback, 
  useContext, 
  FocusEvent,
   
  } from "react";
import {api} from '../services/api';

interface RepositoryProps{
  full_name: string;
  id: number;
  html_url: string;
  description: string;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string;
}

interface Repository{
  items: RepositoryProps[];
}

interface RepositoryData{
  handleInputFocus: () => void;
  handleInputBlur: (event: FocusEvent) => void;
  Repositories: RepositoryProps[];
  RepositoriesCard: RepositoryProps[];
  textInput: string;
  textInputDashboard: string;
  isFocused: boolean;
  isFocusedDashboard: boolean;
  setTextInput: React.Dispatch<React.SetStateAction<string>>
  setTextInputDashboard: React.Dispatch<React.SetStateAction<string>>
  handleInputFocusDashboard: () => void;
  handleInputBlurDashboard: () => void;
}


const RepositoryContext = createContext<RepositoryData>({} as RepositoryData);


export const RepositoryProvider: React.FC = ({ children }) => {
  const [Repositories,setRepositories] = useState<RepositoryProps[]>([]);
  const [RepositoriesCard,setRepositoriesCard] = useState<RepositoryProps[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusedDashboard, SetIsFocusedDashboard] = useState(false);
  const [textInput,setTextInput] = useState('');
  const [textInputDashboard,setTextInputDashboard] = useState('');
 

  
  useEffect(() => {
    async function SearchList(){
      try {
        if(isFocused && textInput !== ''){
         await api.get<Repository>(`repositories?q=${textInput}&per_page=8`)
         .then(response => setRepositories(response.data.items))
       }
      } catch (err){
        return;
      }
    }
    SearchList()

  },[textInput,isFocused]);


  useEffect(() => {
    async function SearchDashboard(){
      try {
        if(isFocusedDashboard && textInputDashboard !== ''){
         await api.get<Repository>(`repositories?q=${textInputDashboard}`)
         .then(response => setRepositoriesCard(response.data.items))
       }
      } catch (err){
        return;
      }
    }
    SearchDashboard()

  },[textInputDashboard,isFocusedDashboard]);
 

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  },[]);

  const handleInputBlur = useCallback((event: FocusEvent) => {
    console.log(event.target.localName);
    if(event.currentTarget.localName === 'div') return;
    setIsFocused(false)
  },[]);

  const handleInputFocusDashboard = useCallback(() => {
    SetIsFocusedDashboard(true);
  },[]);

  const handleInputBlurDashboard = useCallback(() => {
    SetIsFocusedDashboard(false)
  },[]);

  return (
    <RepositoryContext.Provider value={
      {
        handleInputBlur,
        handleInputFocus,
        setTextInputDashboard,
        Repositories,
        RepositoriesCard,
        setTextInput,
        textInput,
        textInputDashboard,
        isFocused,
        isFocusedDashboard,
        handleInputBlurDashboard,
        handleInputFocusDashboard,
      }}>
      {children}
    </RepositoryContext.Provider> 
  )
}

export function useRepository(){
  const context = useContext(RepositoryContext)

  return context;
}