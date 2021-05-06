import React from "react";

import TextField from '@material-ui/core/TextField';
import GitHubIcon from '@material-ui/icons/GitHub';

import ResultOutput from "./ResultOutput";

function ResultView({getResults, search, newSearch, page, selectPage, apiData}) {
    return (
    <div >
      <header>
        
        <form data-testid="new-form" action="" onSubmit={getResults}>
        <GitHubIcon style={{ fontSize: 50 }}/> <TextField inputProps={{ "data-testid": "newInput" }} id="outlined-basic" variant="outlined" value={search} onChange={newSearch}/>
        </form>
      </header>
   
 
    
    
 
   {!search? <p data-testid="messageInitial">Por favor, insira uma busca</p> : 
   <div data-testid="newresult"> 
    <ResultOutput
            
             apiData={apiData}
             page={page} 
             selectPage={selectPage}
             
           />
   </div>
   }
   
   </div>
    )
};

export default ResultView;