import {Form} from './style'
import {useRepository } from '../../hooks/useRepository';



export const SearchDashboard = () => {
  const {
    isFocusedDashboard,
    handleInputBlurDashboard,
    handleInputFocusDashboard,
    setTextInputDashboard,
    textInputDashboard,
    handleAddRepository
    } = useRepository();


  return (
    <Form isFocused={isFocusedDashboard} onSubmit={handleAddRepository}>
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