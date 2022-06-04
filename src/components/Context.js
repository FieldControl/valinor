import React, { useState } from "react"

export const InputContext = React.createContext({});

export const InputProvider = (props) => {
    const [input, setInput] = useState('node')


return (
    <InputContext.Provider value={{ input, setInput }}>
        {props.children}
    </InputContext.Provider>
)
};

export const useInput = () => React.useContext(InputContext);