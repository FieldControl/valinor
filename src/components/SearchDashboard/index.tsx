import {Form} from './style'
import {useRepository } from '../../hooks/useRepository';
import {FormEvent } from 'react'



export const SearchDashboard = () => {
  const {
    isFocusedDashboard,
    handleInputBlurDashboard,
    handleInputFocusDashboard,
    setTextInputDashboard,
    textInputDashboard,
    } = useRepository();

    function handleAddRepository(
      event: FormEvent<HTMLFormElement>) {

      event.preventDefault();
    }

  return (
    <Form isFocused={isFocusedDashboard} onClick={handleAddRepository}>
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