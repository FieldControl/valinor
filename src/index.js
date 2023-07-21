
let currentPage = 0
let totalCount = 0
let nameRepository = ''

const getData =async (repositoryName, page) => {
    currentPage = page
    nameRepository = repositoryName
    const api = `https://api.github.com/search/repositories?q=${repositoryName}&page=${page}&per_page=10`
    try{    
    const data = await fetch(api)
    .then(data => {if(!data.ok){throw new Error(data.status)}; return data.json()})
    .then(data => !data.total_count ? (() => { throw new Error(`Not found ${repositoryName}`) })() : data)
    .catch(err => {throw new Error(err)})

    totalCount = await data.total_count
    const items = await data.items.map(({name, html_url, description, stargazers_count, watchers_count, open_issues_count}) => ({'name': name, 'html_url': html_url, 'description': description, 'stargazers_count': stargazers_count, 'watchers_count': watchers_count, 'open_issues_count': open_issues_count}))
    pages(page)
    repositories.innerHTML = items.map(({name, html_url, description, stargazers_count, watchers_count, open_issues_count}) => `
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
        currentPage = 0
        totalCount = 0
        repositories.innerHTML = `<h1 style="color: #ff4a4a; padding: 0 2em"> ${err.message} </h1>`
    }
}

const [btn, search, repositories, pagination] = ['btn', 'search', 'repositories', 'pages'].map(name => document.getElementById(name))
btn.addEventListener('click', () => {
    search.value && ( new Promise((resolve, reject) => resolve(getData(search.value, 1))))
})




const pages = (value) => {
    let lastPage = Math.ceil(totalCount/10)
    let max = Math.min((lastPage), 100)
    let min = Math.max(Math.min(currentPage - 1 , max - 2), 1)
    let len = Math.min(max, 3)

    pagination.innerHTML = ''

    function insertHTML(idName, name, page){
        new Promise(resolve => resolve(`<button id="btn-${idName}" ${currentPage === page && 'style="color: #587dff; cursor: default"'}> ${name} </button>`))
        .then(data => pagination.innerHTML += data)
        .then(() => document.getElementById(`btn-${idName}`).addEventListener('click', () => currentPage !== page && getData(nameRepository, page)))
    }

    len > 2 && insertHTML(`btn-first`, 
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 122.88 83.21" style="enable-background:new 0 0 122.88 83.21; transform: scaleX(-1);" xml:space="preserve">
        <g>
            <path d="M107.68,12.35c0-4.2,3.4-7.6,7.6-7.6c4.2,0,7.6,3.4,7.6,7.6v58.52c0,4.2-3.4,7.6-7.6,7.6c-4.2,0-7.6-3.4-7.6-7.6V12.35 L107.68,12.35z M87.18,46.44L59.74,80.39c-2.62,3.26-7.4,3.78-10.66,1.16c-3.26-2.62-3.78-7.4-1.16-10.66l17.55-21.7L7.57,49.2 C3.39,49.2,0,45.81,0,41.63c0-4.18,3.39-7.57,7.57-7.57l57.91-0.02L47.93,12.33c-2.62-3.26-2.1-8.03,1.16-10.66 c3.26-2.62,8.03-2.1,10.66,1.16l27.44,33.95l0.06,0.08l0.24,0.31l0.04,0.06l0.07,0.1l0.04,0.05l0.07,0.11l0.1,0.16l0.03,0.04 l0.07,0.12l0.02,0.04l0.07,0.13l0.02,0.04l0.07,0.13l0.02,0.03l0.07,0.14l0.01,0.03l0.07,0.14l0.01,0.03l0.06,0.14l0.01,0.02 l0.06,0.15l0.01,0.02L88.46,39l0,0.02l0.11,0.33l0,0.01l0.1,0.34l0,0.01l0.04,0.17v0.01l0.04,0.17v0.01l0.03,0.17v0l0.03,0.18v0 l0.02,0.18h0l0.02,0.18v0l0.02,0.18l0.01,0.18h0l0.01,0.18l0,0.18v0.18l0,0.18l-0.01,0.18h0l-0.01,0.18l-0.02,0.18v0l-0.02,0.18h0 l-0.02,0.18v0l-0.03,0.18v0l-0.03,0.17v0.01l-0.04,0.17v0.01l-0.04,0.17l0,0.01l-0.1,0.34l0,0.01l-0.11,0.33l0,0.02l-0.06,0.15 l-0.01,0.02l-0.06,0.15l-0.01,0.02l-0.06,0.14l-0.01,0.03l-0.07,0.14l-0.01,0.03l-0.07,0.14l-0.02,0.03l-0.07,0.13l-0.02,0.04 l-0.07,0.13L87.9,45.4l-0.07,0.12l-0.03,0.04l-0.1,0.16l-0.07,0.11l-0.04,0.05l-0.07,0.1l-0.04,0.06l-0.24,0.31L87.18,46.44 L87.18,46.44z"/>
        </g>
    </svg>`, 1)
    
    for(let i = 0; i < len; i++){
            let num = i + min
            insertHTML(num, num, num)
    }

    len > 2 && insertHTML(`btn-last`, 
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 122.88 83.21" style="enable-background:new 0 0 122.88 83.21" xml:space="preserve">
        <g>
            <path d="M107.68,12.35c0-4.2,3.4-7.6,7.6-7.6c4.2,0,7.6,3.4,7.6,7.6v58.52c0,4.2-3.4,7.6-7.6,7.6c-4.2,0-7.6-3.4-7.6-7.6V12.35 L107.68,12.35z M87.18,46.44L59.74,80.39c-2.62,3.26-7.4,3.78-10.66,1.16c-3.26-2.62-3.78-7.4-1.16-10.66l17.55-21.7L7.57,49.2 C3.39,49.2,0,45.81,0,41.63c0-4.18,3.39-7.57,7.57-7.57l57.91-0.02L47.93,12.33c-2.62-3.26-2.1-8.03,1.16-10.66 c3.26-2.62,8.03-2.1,10.66,1.16l27.44,33.95l0.06,0.08l0.24,0.31l0.04,0.06l0.07,0.1l0.04,0.05l0.07,0.11l0.1,0.16l0.03,0.04 l0.07,0.12l0.02,0.04l0.07,0.13l0.02,0.04l0.07,0.13l0.02,0.03l0.07,0.14l0.01,0.03l0.07,0.14l0.01,0.03l0.06,0.14l0.01,0.02 l0.06,0.15l0.01,0.02L88.46,39l0,0.02l0.11,0.33l0,0.01l0.1,0.34l0,0.01l0.04,0.17v0.01l0.04,0.17v0.01l0.03,0.17v0l0.03,0.18v0 l0.02,0.18h0l0.02,0.18v0l0.02,0.18l0.01,0.18h0l0.01,0.18l0,0.18v0.18l0,0.18l-0.01,0.18h0l-0.01,0.18l-0.02,0.18v0l-0.02,0.18h0 l-0.02,0.18v0l-0.03,0.18v0l-0.03,0.17v0.01l-0.04,0.17v0.01l-0.04,0.17l0,0.01l-0.1,0.34l0,0.01l-0.11,0.33l0,0.02l-0.06,0.15 l-0.01,0.02l-0.06,0.15l-0.01,0.02l-0.06,0.14l-0.01,0.03l-0.07,0.14l-0.01,0.03l-0.07,0.14l-0.02,0.03l-0.07,0.13l-0.02,0.04 l-0.07,0.13L87.9,45.4l-0.07,0.12l-0.03,0.04l-0.1,0.16l-0.07,0.11l-0.04,0.05l-0.07,0.1l-0.04,0.06l-0.24,0.31L87.18,46.44 L87.18,46.44z"/>
        </g>
    </svg>`, max)
}

module.exports = { getData, pages }