import './styles.scss'
import IconSearch from '../../assets/icons/icon-search.svg'
import { useState } from 'react'

export default function InputSearch({searchRepository}){

    const [keyword, setKeyword] = useState("")

    function search(key){
        if(key === "Enter"){
            searchRepository(keyword, 1)
        }else if(!key){
            searchRepository(keyword, 1)
        }
    }

    return(
        <div className='input-search'>
            <input type="text" placeholder='Search a repository' className='input' value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyPress={(e) => search(e.key)}/>
            <button className='button-search' onClick={() => search(false)}><img src={IconSearch} alt="Icon Search" /></button>
        </div>
    )
}