import {Form} from './styles'
import { GoRepo } from 'react-icons/go';
import {useRepository} from '../../hooks/useRepository';
import { useState , useCallback, FocusEvent } from 'react';




export const SearchHeader =  () => {
  const { 
    Repositories,
    textInput,
    setTextInput,
  } = useRepository();

  const [isFocused, setIsFocused] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  },[]);

  
  const handleInputBlur = useCallback((event: FocusEvent) => {
    console.log(event.target.localName);
    if(event.currentTarget.localName === 'div') return;
    setIsFocused(false)
  },[]);
  
  return isFocused ? (
    <Form 
      isFocused={isFocused} 
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
      >
      <input
        value={textInput}
        onChange={text => setTextInput(text.target.value)} 
        placeholder="Searcg or jump to ..."  
        type="text"
      >
      </input>
      {Repositories.map( repositorie => (
       <div key={repositorie.id}>
         <GoRepo/>
         <a rel="noreferrer" target='_blank' href={repositorie.html_url}>{repositorie.full_name}</a> 
       </div>
      ))}
    </Form>
  ) : (
    <Form 
      isFocused={isFocused}
      onFocus={handleInputFocus}  
      >
      <input
        value={textInput}
        onChange={text => setTextInput(text.target.value)} 
        placeholder="Searcg or jump to ..." 
        onBlur={handleInputBlur} 
        onFocus={handleInputFocus}  
        type="text" />
  </Form>
  )
}