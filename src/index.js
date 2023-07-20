
let pagina = 1
let totalCount = 1

const getData =async (repositorieName) => {
    const api = `https://api.github.com/search/repositories?q=${repositorieName}&per_page=10`
    try{
    const data = await fetch(api).then(data => {if(!data.ok){throw new Error(data.status)} return data.json()}).catch(err => {throw new Error(err)})
    
    const [totalCount, items] = await [data.total_count, data.items.map(({name, html_url, description, stargazers_count, watchers_count, open_issues_count}) => ({'name': name, 'html_url': html_url, 'description': description, 'stargazers_count': stargazers_count, 'watchers_count': watchers_count, 'open_issues_count': open_issues_count}))]

    return items.map(({name, html_url, description, stargazers_count, watchers_count, open_issues_count}) => `
    <a href='${html_url}'>
        <div class='repository'>
            <h1> ${name} </h1>
            <h3> ${description} </h3>
            <div class='footer'>
                <p> 
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" version="1.1" id="Capa_1" viewBox="0 0 488.85 488.85" xml:space="preserve">
                        <g>
                            <path d="M244.425,98.725c-93.4,0-178.1,51.1-240.6,134.1c-5.1,6.8-5.1,16.3,0,23.1c62.5,83.1,147.2,134.2,240.6,134.2   s178.1-51.1,240.6-134.1c5.1-6.8,5.1-16.3,0-23.1C422.525,149.825,337.825,98.725,244.425,98.725z M251.125,347.025   c-62,3.9-113.2-47.2-109.3-109.3c3.2-51.2,44.7-92.7,95.9-95.9c62-3.9,113.2,47.2,109.3,109.3   C343.725,302.225,302.225,343.725,251.125,347.025z M248.025,299.625c-33.4,2.1-61-25.4-58.8-58.8c1.7-27.6,24.1-49.9,51.7-51.7   c33.4-2.1,61,25.4,58.8,58.8C297.925,275.625,275.525,297.925,248.025,299.625z"/>
                        </g>
                    </svg>
                    ${watchers_count} 
                </p>
                <p> 
                    <svg aria-label="star" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-star">
                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
                    </svg>
                    ${stargazers_count} 
                </p>
                <p> 
                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-issue-opened">
                        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
                    </svg>
                    ${open_issues_count}
                </p>
            </div>
        </div>
    </a>
    `).join('\n')
    }catch(err){
        return err.message
    }
}

const [btn, search, repositories, page] = ['btn', 'search', 'repositories', 'page'].map(name => document.getElementById(name))
btn.addEventListener('click', () => {
    search.value && ( new Promise((resolve, reject) => resolve(getData(search.value))).then(data => repositories.innerHTML = data))
})

