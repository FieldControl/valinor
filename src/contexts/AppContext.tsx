'use Client'
import React, { createContext, useContext, useState , ReactNode} from "react";

interface AppContextType {
  inputValue: string;
  setInputValue: (value: string) => void;
}

interface Children {
    children: ReactNode
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}

export const AppContextProvider = ({ children }: Children) => {
  const [inputValue, setInputValue] = useState<string>("");

  return (
    <AppContext.Provider value={{ inputValue, setInputValue }}>
      {children}
    </AppContext.Provider>
  );
};
