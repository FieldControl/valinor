import { Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons';
import { useRepo } from '../../contexts/RepositoryProvider';

export const InputComponent = () => {

  const {inputValue, setInputValue, getRepo} = useRepo();
  
  const handleChange = (event) => setInputValue(event.target.value);

 return (
  <InputGroup >
    <Input
      type="text"
      size="sm"
      borderRadius="6"
      focusBorderColor={'blue.700'}
      color={['gray.700', 'gray.700', "gray.700", "white"]}
      value={inputValue}
      onChange={handleChange}
      m='1'
      placeholder='Digite aqui'
    />
    <InputRightElement
      as={"button"}
      pb="1"
      borderRadius="8"
      onClick={() => getRepo(1)}
      children={
        <SearchIcon
          color={"gray.600"}
          _hover={{
            color: "gray.800",
          }}
        />
      }
    />
  </InputGroup>
 )
  
};
