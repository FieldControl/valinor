async function renderInfos(importantInfos, currentItem = 1) {
    const options = {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
    };
    const fixedElements = getAllNecessaryElements();
    const githubLanguageColors = await getGithubLanguageColors(options);
    const allEmojis = await getAllEmojis(options);
    const allPages = getAllPages(importantInfos.totalCount);

    fixedElements.repositoriesOcurrencesElement.innerText = whichUnit(importantInfos.totalCount);
    fixedElements.resultsQuantityElement.innerText = importantInfos.totalCount.toLocaleString('en-us');

    importantInfos.repositoriesInfos.forEach((repositoryInfos, index) => {
        mainViewElement.innerHTML += `
        <div class="repository-card">
            <div class="icon-left">
                <i class="far fa-bookmark"></i>
            </div>

            <div class="repository-infos">
                <div class="flex name-container"> 
                    <a class="repository-name normal-link" href="https://github.com/${repositoryInfos.name}">${repositoryInfos.name}</a>
                </div>

                <p class="repository-description" style="display: none;"></p>
                <div class="bullets-container"></div>

                <div class="container-infos">
                    <div class="specific-infos"> 
                        <a href="https://github.com/${repositoryInfos.name}/stargazers" class="hover-blue">
                            <p class="hover-blue">
                            <i class="far fa-star"></i>
                            <span class="stars-count">${repositoryInfos.starsCount}</span>
                            </p>
                        </a>
                    </div>

                    <div class="specific-infos language" style="display:none;"></div>
                    <div class="specific-infos license" style="display:none;"></div>

                    <div class="specific-infos">
                        <p>
                            Updated on <span class="update-at">
                            ${repositoryInfos.updatedAt.day} 
                            ${repositoryInfos.updatedAt.month} ${repositoryInfos.updatedAt.year}
                            </span>
                        </p>
                    </div>

                    <div class="specific-infos issues"></div>
                </div>

            </div>
        </div>`;

        if (repositoryInfos.description) {
            const descriptionElement = document.querySelectorAll('p.repository-description');
            descriptionElement[index].style.display = 'block';
            descriptionElement[index].innerHTML = `${addEmoji(repositoryInfos.description, allEmojis)}`;
        };

        const topicsContainers = document.querySelectorAll('div.bullets-container');
        repositoryInfos.topics.forEach((topic) => {
            topicsContainers[index].innerHTML += `
                <a href="https://github.com/topics/${topic}">
                    <span class="bullet-info">${topic}</span>
                </a>
            `;
        });

        const languageContainers = document.querySelectorAll('div.language');
        if (!!repositoryInfos.language) {
            languageContainers[index].style.display = 'flex';
            languageContainers[index].innerHTML += `
                <div class="color-language-container" style="background-color:${githubLanguageColors[repositoryInfos.language].color}"></div>
                <span>${repositoryInfos.language}</span>
            `;
        };

        const licenseContainers = document.querySelectorAll('div.license');
        if (!!repositoryInfos.license) {
            licenseContainers[index].style.display = 'flex';
            licenseContainers[index].innerHTML += `
                <p>
                    <span>${repositoryInfos.license} license</span> 
                </p>
            `;
        };

        const nameContainer = document.querySelectorAll('div.name-container');
        if (!!repositoryInfos.archived) {
            nameContainer[index].style.display = 'flex';
            nameContainer[index].innerHTML += `
                <span class="bullet-info archived">Archived</span>
            `;
        };

        const issuesContainer = document.querySelectorAll('div.issues');
        if (!!repositoryInfos.openIssues) {
            issuesContainer[index].style.display = 'flex';
            issuesContainer[index].innerHTML += `
            
                <a href="https://github.com/${repositoryInfos.name}/issues" class="hover-blue">
                    <p>
                        ${repositoryInfos.openIssues} open issues 
                    </p>
                </a>
            `;
        };
    });

    mainViewElement.innerHTML += `
        <footer class="flex"></footer>
    `;

    const searchBar = document.querySelector('div.search input');
    Pagination.renderPagination(currentItem, allPages, searchBar.value);
};