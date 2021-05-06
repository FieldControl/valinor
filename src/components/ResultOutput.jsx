import React from 'react';
import Emoji from "react-emoji-render";

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import StarIcon from '@material-ui/icons/Star';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import LanguageIcon from '@material-ui/icons/Language';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import Pagination from '@material-ui/lab/Pagination';


function ResultOutput ({apiData, page, selectPage}) {

    console.log("apiData length = " + apiData.length)
    
    if (apiData.length===0) {
        return (
            <p data-testid="no-result">Nenhum resultado encontrado</p>
        )
        
    }else {

   return (
       <div data-testid="result" className="card">
           
           
           {apiData.map (data => {
              if (!data.description) {
               return (

                    
                    <Card className="cardResult" key={data.id}>
                        <CardContent>

                            <BookmarkBorderIcon style={{ fontSize: 30 }}/>  <a data-testid="url" href={data.html_url}>  {data.full_name} </a>
                            <p className="details"><StarIcon style={{ fontSize: 15}}/> {data.stargazers_count}   <LanguageIcon style={{ fontSize: 15 }}/> {data.language}   <ErrorOutlineIcon style={{ fontSize: 15 }}/> {data.open_issues_count} issues need help</p>  

                        </CardContent>         
                    </Card>
                    )
              } else {   
                
               return (
                    
                <Card className="cardResult" key={data.id}>
                    <CardContent>

                        <BookmarkBorderIcon style={{ fontSize: 30 }}/>  <a href={data.html_url}>  {data.full_name} </a>
                        <p> <Emoji text={data.description}/> </p>
                        <p className="details"><StarIcon style={{ fontSize: 15 }}/> {data.stargazers_count}    <LanguageIcon style={{ fontSize: 15 }}/> {data.language}    <ErrorOutlineIcon style={{ fontSize: 15 }}/> {data.open_issues_count} issues need help</p>           
                    </CardContent>
                </Card>
                )
              }
           

               
               })
               
           }
           <Pagination className="pagination" count={100} variant="outlined" shape="rounded" page={page} onChange={selectPage} />
       </div>
   )
        }
}
export default ResultOutput;