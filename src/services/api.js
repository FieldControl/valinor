export async function query(value, pp, page) {
    const data = fetch(`https://api.github.com/search/repositories?q=${value}&per_page=${pp}&page=${page}`)
        .then(res => res.json())
        .then(res => {return res})
        .catch(err => console.error(err));
    return data;
}