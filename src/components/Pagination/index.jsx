import './styles.scss'

import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight } from 'phosphor-react'
import { useEffect, useState } from 'react'

export default function Pagination ({quantityRepo, perPage, updatePage}) {
    
    const [pageSelect, setPageSelect] = useState(1)
    
    useEffect(() => {
        updatePage(pageSelect)
        window.scrollTo(0, 0)
    }, [pageSelect])


    // quantidade de páginas
    let quantityPages = Math.ceil(quantityRepo / perPage)

    const controls = {
        next(){
            
            if(pageSelect > quantityPages){
                setPageSelect(pageSelect - 1)
            }else if(pageSelect == quantityPages){
                setPageSelect(quantityPages)
            }else{
                setPageSelect(pageSelect + 1)
            }
        },
        prev(){
            
            if(pageSelect < 1){
                setPageSelect(pageSelect + 1)
            }else if(pageSelect == 1){
                setPageSelect(1)
            }else{
                setPageSelect(pageSelect - 1)
            }
        },
        goTo(page){
            if(pageSelect < 1){
                setPageSelect(1)
            }

            setPageSelect(+page)

            if(page > quantityPages){
                setPageSelect(quantityPages)
            }
        }
    }


    return(
        <div className='pagination'>
            <div className='buttons-left'>
                <div className='button' onClick={() => controls.goTo(1)}><CaretDoubleLeft  size={20} color={"#FFF"}/>First Page</div>
                <div className='button' onClick={() => controls.prev()}><CaretLeft size={20} color={"#FFF"}/>Next</div>
            </div>
            <div className='buttons-right'>
                <div className='button' onClick={() => controls.next()}>Prev<CaretRight size={20} color={"#FFF"}/></div>
                <div className='button' onClick={() => controls.goTo(quantityPages)}>Last Page<CaretDoubleRight  size={20} color={"#FFF"}/></div>
            </div>
        </div>
    )
}