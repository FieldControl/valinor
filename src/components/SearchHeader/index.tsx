import {Form} from './styles'
import { GoRepo } from 'react-icons/go';
import {useRepository} from '../../hooks/useRepository';
import { useState , useCallback } from 'react';
import ClickOutside from '../ClickOutside';




export const SearchHeader =  () => {
  const { 
    Pageinfo,
    textInput,
    setTextInput,
  } = useRepository();

  const [isFocused, setIsFocused] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  },[]);

  
  const handleInputBlur = useCallback(() => {
    return setIsFocused(false)
    
  },[]);
  
  return  (
    <ClickOutside onClick={handleInputBlur}>
        <Form 
        isFocused={isFocused} 
        onFocus={handleInputFocus}
        >
        <input
          value={textInput}
          onChange={text => setTextInput(text.target.value)} 
          placeholder="Searcg or jump to ..."  
          type="text"
        >
        </input>
        {isFocused && Pageinfo?.items && Pageinfo.items.map( repositorie => (
        <div key={repositorie.id}>
          <GoRepo/>
          <a rel="noreferrer" target='_blank' href={repositorie.html_url}>{repositorie.full_name}</a> 
        </div>
        ))}
      </Form>
    </ClickOutside>
  )  
}