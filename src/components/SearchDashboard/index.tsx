import { useCallback, useState } from 'react';
import {Form} from './style'



export const SearchDashboard = () => {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  },[]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
  },[]);

  return (
    <Form isFocused={isFocused}>
      <input placeholder="Search Github" onBlur={handleInputBlur} onFocus={handleInputFocus}  type="text" />
      <button>Search</button>
    </Form>
  )
}