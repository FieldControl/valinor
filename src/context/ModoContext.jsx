import { createContext, useState } from "react"
import dark from '../assets/dark.png';
import light from '../assets/light.png';
// criando o context, que é uma invocação do createContext.
export const ModoContext = createContext(); 

// criando provider...como vai envolver todos os componentes precisa de uma própriedade chamada children para imprimir os componentes filhos atraves desse... 

export const ModoProvider = ({ children }) => {
  const [ filterInvert, setFilterInvert ] = useState('invert(0%)');
  const [ mode, setMode ] = useState('white');
  const [ img, setImg ] = useState(light);
  const [ txtmodo, setTxtModo ] = useState('Light Mode');
  const [ txtcor, setTxtCor ] = useState('black');
  const [ backgroundHeader_Footer, setBackgroundHeader_Footer ] = useState('black');
  const [ colorheader_footer, setColorHeader_Footer ] = useState('rgb(255, 0, 255)');
  const [ backgroundSearch, setBackgroundSearch ] = useState('rgb(112, 108, 108)');
  const [ colorInput, setColorInput ] = useState('white');
  const [ colorInputTxt, setColorInputTxt ] = useState('black');
  const [ colorDados, setColorDados ] = useState('linear-gradient(to bottom, black, rgb(82, 80, 80))');


  const alterModo = () =>{
    if(img === light){
      setFilterInvert('invert(100%)')
      setMode('black');
      setImg(dark);
      setTxtModo('Dark Mode');
      setTxtCor('white');
      setBackgroundHeader_Footer('wheat');
      setColorHeader_Footer('black');
      setBackgroundSearch('whitesmoke');
      setColorInput('black');
      setColorInputTxt('white');
      setColorDados('linear-gradient(to right bottom, #b59c63, black)')
    }
    else {
      setFilterInvert('invert(0%)')
      setMode('white');
      setImg(light);
      setTxtModo('Light Mode');
      setTxtCor('black');
      setBackgroundHeader_Footer('black');
      setColorHeader_Footer('rgb(255, 0, 255)');
      setBackgroundSearch('rgb(112, 108, 108)');
      setColorInput('white');
      setColorInputTxt('black');
      setColorDados('linear-gradient(to bottom, black, rgb(82, 80, 80))');
    }
  }

  //value é passado os valores o de consultar e o de alterar para serem acessados de outro components.
  return <ModoContext.Provider value={{ filterInvert, mode, img, txtmodo, txtcor, backgroundHeader_Footer, colorheader_footer, backgroundSearch, colorInput, colorInputTxt, colorDados, alterModo}}>{ children }</ModoContext.Provider>;
};