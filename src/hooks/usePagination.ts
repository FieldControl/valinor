import { useEffect, useState } from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import qs from 'query-string';

export default function usePagination(){
   const location = useLocation()
   const history = useHistory()
   
   const [actualPage, setActualPage] = useState(getActualPage() || 1);

   function getActualPage(){
    const queryParams = qs.parse(location.search)
    const page = queryParams.page
    
    return page ? Number(page) : undefined;
   }

    useEffect(() => {
    const queryParams = qs.parse(location.search)

    history.push({
      search: qs.stringify({
        ...queryParams,
        page: actualPage
      })
    })
     
    },[actualPage])

  return{
    setActualPage,
    actualPage
  }
}