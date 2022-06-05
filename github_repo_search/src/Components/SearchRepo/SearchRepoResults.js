import React, {useEffect} from "react";
import styled from "styled-components";
import stars  from "../../img/stars.svg"

const fontInfosSize = "0.7em"
const imgStarsSize = "1.5em"

const DivResults = styled.div`
width: 450px;
display: flex;
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
`

const ImgStars = styled.img`
width: ${imgStarsSize};
height: ${imgStarsSize};
`

const SearchRepoResults = (props)=>{
    console.log(props.results[0])
    // console.log(props.results[1])

    const searchRepoResultsMap = props.results.map((repo)=>{
        return <DivResults key={repo.id}>
                <div>
                    <SpanNomeLogin>{repo.owner.login}</SpanNomeLogin> 
                    <SpanNomeRepo>/{repo.name}</SpanNomeRepo>
                </div>
                <div>
                    <span>{repo.description}</span>
                </div>
                <div style={{display: "flex", marginTop: "5px"}}>
                    <DivInfos>
                        <ImgStars src={stars} />
                        <span>{repo.stargazers_count>=1000? `${Math.floor(repo.stargazers_count/10)/100}K` : repo.stargazers_count}</span>
                    </DivInfos>
                    {repo.language && <DivInfos>{repo.language}</DivInfos>}
                    {repo.license && repo.license.key!== "other" && <DivInfos>{repo.license.spdx_id} license</DivInfos>}
                    <DivInfos>watchers:
                         {repo.watchers>=1000? `${Math.floor(repo.watchers/10)/100}K`: repo.watchers}
                    </DivInfos>
                    {repo.has_issues && <DivInfos>issues: {repo.open_issues>=1000? `${Math.floor(repo.open_issues/10)/100}K`: repo.open_issues}</DivInfos>}
                    <DivInfos>
                        forks: {repo.forks>=1000? `${Math.floor(repo.forks/10)/100}K`: repo.forks}
                    </DivInfos>
                </div>
            </DivResults>
      })
    
    return <>
        {props.results && searchRepoResultsMap}
        {props.error && props.error}
    </>
}

export default SearchRepoResults