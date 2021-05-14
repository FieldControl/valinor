import {Form} from './styles'
import { GoRepo } from 'react-icons/go';
import {useRepository} from '../../hooks/useRepository';




export const SearchHeader =  () => {
  const { 
    Repositories,
    textInput,
    handleInputBlur,
    handleInputFocus,
    setTextInput,
    isFocused,
  } = useRepository();

  
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