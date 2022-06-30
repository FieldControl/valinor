import { createContext, useEffect, useState } from 'react';
import api from '../services';

const GlobalContext = createContext();

export const GlobalProvider = (props) => {
    
    const [text, setText] = useState("Node")
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState([])

    useEffect(() => {
       makeRequest() 
    },[])

    const makeRequest = async () => {
        setLoading(true)
        const res = await api.get(`/search/repositories?q=${text}`)
        setResponse(res.data)
        setLoading(false)
    }

    const textModifier = (text) => {
        const textWithoutSpaces = text.replaceAll(" ","%20");
        setText(textWithoutSpaces)
    }

    return (
        <GlobalContext.Provider value={{
            response,
            text,
            loading,
            textModifier,
            makeRequest,
        }}>
            {props.children}
        </GlobalContext.Provider>

    )
}

export default GlobalContext;