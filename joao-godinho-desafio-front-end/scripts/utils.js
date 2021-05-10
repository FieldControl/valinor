function whichUnit(number) {
    let result = number.toString();
    const units = {
        K: 10 ** 3,
        M: 10 ** 6,
        B: 10 ** 9,
    };

    Object.keys(units).forEach((key) => {
        if (number / units[key] >= 1) {
            result = number / units[key];
            result = result.toString();
            result = result.split('.')[0] + key;
        };
    });

    return result;
};

function getAllNecessaryElements() {
    const repositoriesOcurrencesElement = document.querySelector('span.ocurrences-number.repositories-number');
    const resultsQuantityElement = document.querySelector('span.results-quantity');

    return {
        repositoriesOcurrencesElement,
        resultsQuantityElement,
    };
};

async function getGithubLanguageColors(options) {
    const response = await fetch('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json', options);

    return await response.json();
};

async function getAllEmojis(options) {
    const response = await fetch('https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json', options);

    return await response.json();
};

function addEmoji(text, allEmojis) {
    if (text) {
        text.split(':').forEach(space => {
            if (space) {
                if (allEmojis[space]) {
                    text = text.replace(space, allEmojis[space]);
                    text = text.replace(/:/g, '');
                };
            };
        });
    };

    return text;
};

async function getImportantInfos(query, order , page = 1) {
    const pages = await searchRepositories(query, order, page);
    const totalCount = pages.total_count;
    let repositoriesInfos = [];
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const licenseExists = license => {
        if (license !== null && license.url !== null && license.spdx_id) {
            return license.spdx_id;
        };

        return null;
    };

    mainViewElement.innerHTML = '<div></div>';

    pages.items.forEach(async (item) => {
        const license = licenseExists(item.license);
        const updatedAt = new Date(item.pushed_at).toLocaleDateString('pt-BR').split('/');
        const updatedAtDay = updatedAt[0][0] == '0' ? updatedAt[0].slice(1, 2) : updatedAt[0];
        const updatedAtMonth = updatedAt[1][0] == '0' ? updatedAt[1].slice(1, 2) : updatedAt[1];

        repositoriesInfos.push({
            name: item.full_name,
            description: item.description,
            topics: item.topics,
            starsCount: whichUnit(item.stargazers_count),
            language: item.language,
            archived: item.archived,
            openIssues: item.open_issues_count,
            license: license,
            updatedAt: {
                day: updatedAtDay,
                month: months[updatedAtMonth - 1],
                year: updatedAt[2]
            },
        });
    });
    return { totalCount, repositoriesInfos };
};

function getAllPages(totalCount) {
    totalCount = totalCount > 1000 ? 1000 : totalCount;
    const totalPage = Math.ceil(totalCount / 10);
    const allPages = [];

    for (let i = totalPage; i > 0; i--) {
        allPages.push(i);
    };

    return allPages.reverse();
};