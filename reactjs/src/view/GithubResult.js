import React from "react";
import './GithubResult.css';

// URL, descrição, contagem de watchers, de estrelas, issues e etc..
export const GithubResult = ({ itemData }) => {
	return (
		<div className="github-card">
			{ itemData && 
				<div key={itemData.id}>
					<a href={itemData.html_url}> {itemData.html_url} </a>
					<p>{itemData.description}</p>
					<p> Watchers: {itemData.watchers_count} </p>
					<p> Stars: {itemData.stargazers_count} </p>
					<p> Issues: {itemData.open_issues} </p>
				</div>
			}
		</div>
	);
};