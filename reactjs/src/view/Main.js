import { useEffect, useState } from "react";
import { searchTerm } from "../controller/functions";
import { GithubResult } from "./GithubResult";
import './Main.css';

export const Main = () => {
	const [searchValue, setSearchValue] = useState('');
	const [dataFromGithub, setDataFromGithub] = useState([]);
	const [page, setPage] = useState(1);

	async function handleClick() {
		const results = await searchTerm(searchValue,page);
		console.log('results :', '[DEV_LOG]', results);
		setDataFromGithub(results);
	}
	useEffect(() => {
		handleClick();
	}, [page]);
	
	return (
		<div>
			<div className="header">
				<div>
					<div className="search-bar">
						<input type="text" placeholder="Procurar repositórios..." 
							value={searchValue} 
							onChange={(e) => setSearchValue(e.target.value)} />
						<button className="search-button" onClick={() => handleClick(searchValue)}>Pesquisar</button>
					</div>
				</div>
				<h1>Github Search</h1>
			</div>

			{dataFromGithub?.total_count > 0 && (
				<div>
					{dataFromGithub?.total_count} Repository Results
				</div>
			)}

			<div classxName="results">
				{dataFromGithub?.items?.length > 0 && dataFromGithub?.items.map(item => (
					<GithubResult itemData={item} />
				))}
			</div>
			{dataFromGithub?.total_count > 0 && (
				<div className="footer">
					<div>
						<span>Page {page} of {Math.floor(dataFromGithub?.total_count/30) + 1}</span>
					</div>
						<div>
						<	button className="next-page" onClick={() => setPage(page + 1)}>Next Page</button>
						</div>
				</div>
				)
			}
		</div>
	);
};