import { useCallback, useState } from 'react';
import {Form} from './style'
import { GoRepo } from 'react-icons/go';



export const SearchHeader = () => {
  const [isFocused, setIsFocused] = useState(false);

  



  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  },[]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
  },[]);

  return (
    <Form isFocused={isFocused}>
      <input 
      placeholder="Searcg or jump to ..." 
      onBlur={handleInputBlur} 
      onFocus={handleInputFocus}  
      type="text" />
      <div>
        <GoRepo/>
        <a href="#">Bismarck</a>
      </div>
      <div>
        <GoRepo/>
        <a href="#">Bismarck</a>
      </div>
      <div>
        <GoRepo/>
        <a href="#">Bismarck</a>
      </div>
    </Form>
  )
}