async function searchRepositories(query, order = 'desc', page = 1) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append("Accept", "application/vnd.github.mercy-preview+json");
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: headers,
        cache: 'default',
    };

    const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=10&page=${page}&order=${order}`, options);

    return await response.json();
};