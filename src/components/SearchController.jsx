import React, {useState} from "react";


import ResultView from "./ResultView";


function SearchController() {
const [search, setSearch] = useState('');
const [page, setPage] = useState(1);
const [apiData, setApiData] = useState([]);
const apiUrl =`https://api.github.com/search/repositories?q=${search}&per_page=10&page=${page}`


function getResults(event) {
  event.preventDefault();
  console.log("search = "+search)
  console.log("search is bool = "+(!search))

  if (!search) {
    console.log()
    return 
  } else {
    fetch(apiUrl)
    .then((res) => res.json())
     .then((data) => setApiData(data.items))
     
     // console.log("getResults = " + apiUrl)
  }   
 }

 function selectPage(event, value) {
  event.preventDefault();
   setPage(value)
   console.log("select page using " + value)

   const apiUrl2 =`https://api.github.com/search/repositories?q=${search}&per_page=10&page=${value}`


   if (!search) {
       return
   } else {
   fetch(apiUrl2)
         .then((res) => res.json())
          .then((data) => setApiData(data.items))
      console.log("selectpage = " + apiUrl2)
 }
}

 function newSearch(event) {
   setSearch(event.target.value)
   setPage(1)
 }


return (

  <ResultView
    search={search}
    newSearch={newSearch}
    apiData={apiData}
    getResults={getResults}
    selectPage={selectPage}
    
    />
);
}

export default SearchController;