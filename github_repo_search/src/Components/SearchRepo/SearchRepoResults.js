//exibição dos resultados na tela

import React from "react";
import styled from "styled-components";
import stars  from "../../img/stars.svg"

const fontInfosSize = "0.7em"
const imgStarsSize = "1.5em"

const DivResults = styled.div`
width: 450px;
display: flex;
flex-wrap: wrap;
flex-direction: column;
padding: 20px 0;
border-bottom: 1px solid rgb(119,136,153, 0.5);

animation: aparece 2000ms;

@keyframes aparece {
    from{
        opacity: 0;
    }  
    to{
        opacity: 1;
    } 
}

@media screen and (max-width: 450px){
    overflow-x: scroll;
    width: calc(100vw - 10px);
    font-size:0.7em;
}
`
const SpanNomeRepo = styled.span`
color: rgb(83,166,255,0.9);
` 

const SpanNomeLogin = styled.span`
color:rgb(83,166,255,0.7);
`

const DivInfos = styled.div`
color: #8b9498;
display: flex;
flex-wrap: wrap;
align-items: center;
margin-right: 10px;

font-size: ${fontInfosSize};

@media screen and (max-width: 450px){
    margin-right: 5px;
}
`

const A = styled.a`
text-decoration: none;
color: #8b9498;
display: flex;
align-items: center;

&:hover{
color: rgb(83,166,255);
} 
`

const ARepo = styled.a`
cursor: pointer;
margin-bottom: 10px;
&:hover{
    text-decoration: underline;
    color: rgb(83,166,255,0.9);
}
`

const DivTopics = styled.div`
margin-right: 10px;
font-size: ${fontInfosSize};
border-radius: 10px;
margin-top: 5px;
background-color: rgb(83,166,255,0.1);
color: rgb(83,166,255);
padding: 2px 5px;

&:hover {
    background-color: rgb(83,166,255);
    color: #fff;
}
`

const ImgStars = styled.img`
width: ${imgStarsSize};
height: ${imgStarsSize};
`

const SearchRepoResults = (props)=>{

    const searchRepoResultsMap = props.results.map((repo)=>{
        return <DivResults key={repo.id}>
                <ARepo href={`https://github.com/${repo.owner.login}/${repo.name}`}>
                    <div>
                        <SpanNomeLogin>{repo.owner.login}</SpanNomeLogin> 
                        <SpanNomeRepo>/{repo.name}</SpanNomeRepo>
                    </div>
                </ARepo>
               
                <div>
                    <span>{repo.description}</span>
                </div>
               
                <div style={{display: "flex", marginTop: "5px", width: "450px", flexWrap: "wrap"}}>
                    {repo.topics.length>0 && repo.topics.map((topic)=> <a href={`https://github.com/topics/${topic}`}> <DivTopics>{topic}</DivTopics> </a>)}
                </div>
               
                <div style={{display: "flex", marginTop: "5px"}}>
                    
                    <DivInfos>
                        <A href={`https://github.com/${repo.owner.login}/${repo.name}/stargazers`}>
                            <ImgStars src={stars} />
                            <span>{repo.stargazers_count>=1000? `${Math.floor(repo.stargazers_count/10)/100}K` : repo.stargazers_count}</span>
                        </A>
                    </DivInfos>
                    
                    {repo.language && <DivInfos>{repo.language}</DivInfos>}
                    
                    {repo.license && repo.license.key!== "other" && <DivInfos>{repo.license.spdx_id} license</DivInfos>}
                   
                    <DivInfos>watchers:
                         {repo.watchers>=1000? `${Math.floor(repo.watchers/10)/100}K`: repo.watchers}
                    </DivInfos>
                    {repo.has_issues &&  <DivInfos><A href={`https://github.com/${repo.owner.login}/${repo.name}/issues`}>issues: {repo.open_issues>=1000? `${Math.floor(repo.open_issues/10)/100}K`: repo.open_issues}</A></DivInfos>}
                   
                    <DivInfos>
                        forks: {repo.forks>=1000? `${Math.floor(repo.forks/10)/100}K`: repo.forks}
                    </DivInfos>
                </div>
            </DivResults>
      })
    
    return <>
        {/* exibe resultados da pesquisa ou erro */}
        {props.results && searchRepoResultsMap}
        {props.error && props.error}
    </>
}

export default SearchRepoResults