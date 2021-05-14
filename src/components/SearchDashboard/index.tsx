import {Form} from './style'
import {useRepository } from '../../hooks/useRepository';
import { useCallback , useState} from 'react';



export const SearchDashboard = () => {
  const {handleAddRepository, setTextInputDashboard,textInputDashboard} = useRepository();
  
  const [isFocused, SetIsFocused] = useState(false);
  
    
  const handleInputFocusDashboard = useCallback(() => {
    SetIsFocused(true);
  },[]);

  const handleInputBlurDashboard = useCallback(() => {
    SetIsFocused(false)
  },[]);
  
  

  return (
    <Form isFocused={isFocused} onSubmit={handleAddRepository}>
      <input 
        placeholder="Search Github" 
        onBlur={handleInputBlurDashboard} 
        onFocus={handleInputFocusDashboard}  
        type="text"
        value={textInputDashboard}
        onChange={text => setTextInputDashboard(text.target.value)}
      />
      <button type="submit">Search</button>
    </Form>
  )
}