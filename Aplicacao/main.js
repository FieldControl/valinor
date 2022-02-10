let url;

function getQuery() {
    githubConnect();
    showResultsCount();
    listResults();
};

function githubConnect() {
    let gitHubQuery = document.getElementById("search-input").value;
    url = `https://api.github.com/search/repositories?q=${gitHubQuery}`;
    return url;
};

function showResultsCount() {
    fetch(url).then(response => response.json()).then(data => {
        return document.getElementById("total-results").innerHTML = 
        `<p>Showing 30 of ${data.total_count} results</p>`;
    });
};

function listResults() {
    fetch(url).then(response => response.json()).then(data => {
        const results = Array.from({length: 30}).map((_, i) => {
            return `<div class="item">
                <span class='item-full-name' name='${data.items[i].full_name}' title='${data.items[i].name}'>
                    <svg class="item-book-icon" style="color: #f1f1f1" aria-hidden="true" height="24" viewBox="0 0 16 16" version="1.1" width="24" data-view-component="true" class="octicon-octicon-repo">
                        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                    </svg>
                    <a href='${data.items[i].html_url}' target='_blank' class='item-full-name-link'>
                        <h3 class='item-full-name-heading'>${data.items[i].full_name}</h3>
                    </a>
                </span>
                ${data.items[i].description}<br>

                <div class='topics' name='topics' title='topics'>
                    <span class='topics-span'>
                        Topics: ${data.items[i].topics.join(", ")}
                    </span>
                </div>

                <div class='div-count'>
                    <span class='count' name='watchers' title='${data.items[i].watchers_count} watchers'>
                        <svg class="count-icon" aria-hidden="true" height="18" viewBox="0 0 16 16" version="1.1" width="18" data-view-component="true" class="octicon octicon-eye mr-2" color="white">
                            <path fill-rule="evenodd" d="M1.679 7.932c.412-.621 1.242-1.75 2.366-2.717C5.175 4.242 6.527 3.5 8 3.5c1.473 0 2.824.742 3.955 1.715 1.124.967 1.954 2.096 2.366 2.717a.119.119 0 010 .136c-.412.621-1.242 1.75-2.366 2.717C10.825 11.758 9.473 12.5 8 12.5c-1.473 0-2.824-.742-3.955-1.715C2.92 9.818 2.09 8.69 1.679 8.068a.119.119 0 010-.136zM8 2c-1.981 0-3.67.992-4.933 2.078C1.797 5.169.88 6.423.43 7.1a1.619 1.619 0 000 1.798c.45.678 1.367 1.932 2.637 3.024C4.329 13.008 6.019 14 8 14c1.981 0 3.67-.992 4.933-2.078 1.27-1.091 2.187-2.345 2.637-3.023a1.619 1.619 0 000-1.798c-.45-.678-1.367-1.932-2.637-3.023C11.671 2.992 9.981 2 8 2zm0 8a2 2 0 100-4 2 2 0 000 4z"></path>
                        </svg>
                        ${data.items[i].watchers_count}
                    </span>

                    <span class='count' name='stars' title='${data.items[i].stargazers_count} stars'>
                        <svg class="count-icon" aria-hidden="true" height="18" viewBox="0 0 16 16" version="1.1" width="18" data-view-component="true" class="octicon octicon-star mr-2" color="white">
                            <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
                        </svg>
                        ${data.items[i].stargazers_count}
                    </span>

                    <span class='count' name='open issues' title='${data.items[i].open_issues_count} open issues'>
                        <svg class="count-icon" aria-hidden="true" height="18" viewBox="0 0 16 16" version="1.1" width="18" data-view-component="true" class="octicon octicon-issue-opened">
                            <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path><path fill-rule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"></path>
                        </svg>
                        ${data.items[i].open_issues_count}
                    </span>

                    <span class='count' name='forks' title='${data.items[i].forks_count} forks'>
                        <svg class="count-icon" aria-hidden="true" height="18" viewBox="0 0 16 16" version="1.1" width="18" data-view-component="true" class="octicon octicon-repo-forked mr-2" color="white">
                            <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                        </svg>
                        ${data.items[i].forks_count}
                    </span>
                </div>
            </div>`;
        });
        for (let i = 0; i <= 30; i++) {
            document.querySelector('#section-results .list').innerHTML = results.join("");
        };      
    });
};

