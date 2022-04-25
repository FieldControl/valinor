import axios from "axios";

export async function searchTerm(term,page=1) {
	console.log('Pesquisando por ' +term);
	const results = await axios.get('https://api.github.com/search/repositories?q=' + term + '&page=' + page); 
	return results.data;
}