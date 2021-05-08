import React, { InputHTMLAttributes } from 'react'
import { AiOutlineSearch } from "react-icons/ai";
import { useHistory } from 'react-router';

import * as S from './styles'

interface InputSearchProps extends InputHTMLAttributes<HTMLInputElement>  {
    value: string,
    change: Function,
    submit: Function,
}

const InputSearch: React.FC<InputSearchProps> = ({value,submit, change, ...rest}) => {

    const history = useHistory()

    function changeValue (e: React.ChangeEvent<HTMLInputElement>) {
        change(e.target.value)
    }


    function sendSubmit (e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        submit(value)

        history.push('/search')
    }

    return (
        <S.Container onSubmit={(e) => sendSubmit(e)}>
            <S.Input
                value={value}
                onChange={(e) => changeValue(e)} {...rest}
            />
            <S.Button type="submit">
                <AiOutlineSearch/>
            </S.Button>
        </S.Container>
    )
}

export default InputSearch