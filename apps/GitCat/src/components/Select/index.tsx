import React, {useRef} from 'react'

import * as S from './styles'

interface OptionsData {
  name: string;
  display: string;
}

interface SelectProps {
  options: OptionsData[];
  value: OptionsData;
  update: React.Dispatch<React.SetStateAction<OptionsData>>;
}


const Select: React.FC<SelectProps> =  ({options, value, update}) => {

  const details = useRef<HTMLElement>(null)

  const tempFunction = (e: MouseEvent) => {
    if (e.target) {
      let target: any = e.target

      if (details.current && !details.current.contains(target)) {
        details.current.removeAttribute('open')
        document.removeEventListener('click', tempFunction)
      }
    }
  }

  function closeDetails () {
    document.addEventListener('click', tempFunction)
    details.current?.removeAttribute('open')
  }

  function selectOption (option: OptionsData) {
    update(option)
    document.removeEventListener('click', tempFunction )
  }

  return (
    <S.Container ref={details} onClick={closeDetails}>
      <summary><span>Sort:&nbsp;</span> {value.display}</summary>
      <S.Options>
        <p>Sort options</p>
        {options.map((option, index) => {
          return <button key={index} onClick={() => selectOption(option)}>{option.display}</button>
        })}
      </S.Options>
    </S.Container>
  )
}

export default Select