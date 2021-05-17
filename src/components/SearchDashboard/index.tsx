import {Form} from './style'
import {useRepository } from '../../hooks/useRepository';
import { useCallback , useState, FormEvent, useEffect} from 'react';



export const SearchDashboard = () => {
  const {
    AddRepository,
    page
  } = useRepository();
  
  const [isFocused, SetIsFocused] = useState(false);
  const [input, setInput] = useState('');
 
  
    
  const handleInputFocusDashboard = useCallback(() => {
    SetIsFocused(true);
  },[]);

  const handleInputBlurDashboard = useCallback(() => {
    SetIsFocused(false)
  },[]);
  
  function handleChange(text: string){
    setInput(text)
  }

  function handleSubmit(event: FormEvent){
    event.preventDefault();
    AddRepository(input);
  }

  useEffect(() => {
    if(input !== ''){
      AddRepository(input);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[page])



  return (
    <Form isFocused={isFocused} onSubmit={handleSubmit}>
      <input 
        placeholder="Search Github" 
        onBlur={handleInputBlurDashboard} 
        onFocus={handleInputFocusDashboard}  
        type="text"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
      <button type="submit">Search</button>
    </Form>
  )
}